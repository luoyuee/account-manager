/**
 * 将 README.md 中“相对于仓库的图片/文件链接”替换为 GitHub Raw 绝对地址，并输出替换报告。
 *
 * 为什么需要：
 * - Docker Hub 的 Overview（full_description）渲染 README 时，不会按仓库上下文解析相对路径；
 * - 将相对路径改为 raw.githubusercontent.com 的绝对地址后，图片/文件才能正确展示与访问。
 *
 * 设计目标：
 * - 只替换确实指向“仓库内文件”的链接（通过本地文件是否存在来判断）
 * - 完整 URL（含协议头）不替换：例如 https:// / http:// / data: / mailto: / //cdn...
 * - 保留查询参数与锚点：例如 ./doc.md#section、./img.png?raw=1
 * - 输出 GitHub Actions Summary：展示替换数量与替换后的 Markdown 全量内容
 *
 * 用法：
 *   node scripts/replace-readme-links-for-dockerhub.js --write --summary-file "$GITHUB_STEP_SUMMARY"
 *
 * 参数：
 *   --readme <path>        README 路径（默认 README.md）
 *   --raw-prefix <url>     指定 Raw 前缀（例如 https://raw.githubusercontent.com/owner/repo/<sha>）
 *   --summary-file <path>  报告输出文件（GitHub Actions 使用 $GITHUB_STEP_SUMMARY）
 *   --write                将替换结果写回 README（默认只计算，不写回）
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

/**
 * @param {string[]} argv
 * @returns {{ readmePath: string; rawPrefix: string; summaryFile: string; write: boolean; help: boolean }}
 */
const parseArgs = (argv) => {
  const args = argv.slice(2);
  const help = args.includes("--help") || args.includes("-h");
  const write = args.includes("--write");

  const getValue = (flag) => {
    const idx = args.indexOf(flag);
    if (idx === -1) return "";
    return args[idx + 1] ?? "";
  };

  const readmePath = getValue("--readme") || "README.md";
  const rawPrefix = getValue("--raw-prefix") || "";
  const summaryFile = getValue("--summary-file") || process.env.GITHUB_STEP_SUMMARY || "";

  return { readmePath, rawPrefix, summaryFile, write, help };
};

/**
 * 判断是否为“完整 URL / 非仓库内路径”的目标。
 *
 * 规则说明：
 * - #xxx 视为锚点链接，不替换
 * - //cdn.xxx 视为协议相对 URL，不替换
 * - scheme:xxx（例如 https: / data: / mailto: / tel:）不替换
 *
 * @param {string} url
 * @returns {boolean}
 */
const isAbsoluteLikeUrl = (url) => {
  const value = url.trim();
  if (value === "") return true;
  if (value.startsWith("#")) return true;
  if (value.startsWith("//")) return true;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return true;
  return false;
};

/**
 * 将 Markdown 括号内的目标拆成：
 * - url：不含 title 的 URL 部分
 * - suffix：保留原样的 title/其它后缀（例如 ` "title"`），用于拼回去
 *
 * 支持：
 * - [text](<./a b.png>) 这类用尖括号包裹的写法
 *
 * @param {string} raw
 * @returns {{ url: string; suffix: string }}
 */
const splitUrlAndTitle = (raw) => {
  const s = raw.trim();

  if (s.startsWith("<")) {
    const end = s.indexOf(">");
    if (end !== -1) {
      const url = s.slice(1, end).trim();
      const suffix = s.slice(end + 1);
      return { url, suffix };
    }
  }

  const m = s.match(/^(\S+)(\s+.*)?$/);
  return { url: (m?.[1] ?? s).trim(), suffix: m?.[2] ?? "" };
};

/**
 * 将 URL 中的查询参数/锚点拆出并保留：
 * - input:  ./doc.md?x=1#sec
 * - output: { pathPart: "./doc.md", query: "?x=1", fragment: "#sec" }
 *
 * @param {string} input
 * @returns {{ pathPart: string; query: string; fragment: string }}
 */
const splitQueryAndFragment = (input) => {
  let pathPart = input;
  let query = "";
  let fragment = "";

  const hashIdx = pathPart.indexOf("#");
  if (hashIdx !== -1) {
    fragment = pathPart.slice(hashIdx);
    pathPart = pathPart.slice(0, hashIdx);
  }

  const qIdx = pathPart.indexOf("?");
  if (qIdx !== -1) {
    query = pathPart.slice(qIdx);
    pathPart = pathPart.slice(0, qIdx);
  }

  return { pathPart, query, fragment };
};

/**
 * 将 Markdown 的相对/仓库根路径解析成“仓库根目录下的规范化路径”。
 *
 * 关键点：
 * - 允许 README 在子目录：相对路径按 README 所在目录解析
 * - 以 / 开头的路径视为“相对于仓库根”（而不是相对于 README 所在目录）
 * - 解析后若出现 .. 前缀，说明试图跳出仓库，直接拒绝替换
 *
 * @param {{ readmeDir: string; rawUrlPathPart: string }} input
 * @returns {string | null}
 */
const resolveRepoPath = ({ readmeDir, rawUrlPathPart }) => {
  const trimmed = rawUrlPathPart.trim();
  if (trimmed === "") return null;

  const isRepoRootPath = trimmed.startsWith("/");
  const candidate = isRepoRootPath ? trimmed.slice(1) : trimmed;
  const base = isRepoRootPath ? "" : readmeDir;

  const joined = path.posix.normalize(path.posix.join(base, candidate));
  if (joined.startsWith("..")) return null;

  return joined.replace(/^\.\/+/, "");
};

/**
 * 尝试推导 Raw 前缀：
 * - 优先使用参数 --raw-prefix
 * - 否则使用：GITHUB_REPOSITORY + 当前 checkout 的 HEAD SHA
 *
 * @returns {string}
 */
const inferRawPrefix = () => {
  const repoFull = process.env.GITHUB_REPOSITORY || "";
  if (!repoFull) return "";

  let sha = "";
  try {
    sha = execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    sha = (process.env.GITHUB_SHA || "").trim();
  }

  if (!sha) return "";
  return `https://raw.githubusercontent.com/${repoFull}/${sha}`;
};

/**
 * @param {string} p
 * @returns {boolean}
 */
const exists = (p) => {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {{ readmePath: string; rawPrefix: string }}
 * @returns {{ replacedCount: number; updated: string; rawPrefixUsed: string }}
 */
const replaceLinks = ({ readmePath, rawPrefix }) => {
  const original = fs.readFileSync(readmePath, "utf8");
  const readmeDir = path.posix.dirname(readmePath).replaceAll("\\", "/");

  let replacedCount = 0;
  const updated = original.replace(/(!?\[[^\]]*\])\(([^)\n]+)\)/g, (match, label, destRaw) => {
    const { url, suffix } = splitUrlAndTitle(destRaw);
    if (isAbsoluteLikeUrl(url)) return match;

    const { pathPart, query, fragment } = splitQueryAndFragment(url);
    const resolved = resolveRepoPath({
      readmeDir: readmeDir === "." ? "" : readmeDir,
      rawUrlPathPart: pathPart
    });
    if (!resolved) return match;

    if (!exists(resolved)) return match;

    replacedCount += 1;
    return `${label}(${rawPrefix}/${resolved}${query}${fragment}${suffix})`;
  });

  return { replacedCount, updated, rawPrefixUsed: rawPrefix };
};

/**
 * @param {{ summaryFile: string; rawPrefix: string; replacedCount: number; markdown: string }}
 */
const writeSummary = ({ summaryFile, rawPrefix, replacedCount, markdown }) => {
  if (!summaryFile) return;

  const content = [
    "## Docker Hub Overview 同步 - README 替换报告",
    "",
    `- Raw 前缀: \`${rawPrefix}\``,
    `- 替换数量: ${replacedCount}`,
    "",
    "### 替换后的 README",
    "",
    "```markdown",
    markdown,
    "```",
    ""
  ].join("\n");

  fs.appendFileSync(summaryFile, content, "utf8");
};

const main = () => {
  const { readmePath, rawPrefix: rawPrefixArg, summaryFile, write, help } = parseArgs(process.argv);

  if (help) {
    console.log(
      'Usage: node scripts/replace-readme-links-for-dockerhub.js --write --summary-file "$GITHUB_STEP_SUMMARY"'
    );
    process.exit(0);
  }

  if (!exists(readmePath)) {
    console.log(`README not found: ${readmePath}`);
    process.exit(0);
  }

  const inferred = inferRawPrefix();
  const rawPrefix = rawPrefixArg || inferred;
  if (!rawPrefix) {
    console.error(
      "Raw prefix is missing. Provide --raw-prefix or ensure GITHUB_REPOSITORY and git are available."
    );
    process.exit(1);
  }

  const { replacedCount, updated } = replaceLinks({ readmePath, rawPrefix });

  if (write) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }

  writeSummary({ summaryFile, rawPrefix, replacedCount, markdown: updated });

  console.log(`Replaced links: ${replacedCount}`);
};

main();

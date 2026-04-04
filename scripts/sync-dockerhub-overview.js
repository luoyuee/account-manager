/**
 * 将 README 同步到 Docker Hub 仓库的 Overview（full_description）。
 *
 * 对应原生 API 流程：
 * 1) POST https://hub.docker.com/v2/users/login/ 获取 JWT token
 * 2) PATCH https://hub.docker.com/v2/repositories/<namespace>/<repo>/ 更新 full_description
 *
 * 设计目标：
 * - 只依赖 Node 内置能力（Node 18+ 的 fetch）
 * - 读取本地 README.md，作为 full_description 的内容提交
 * - 输出可读的错误信息，便于在 Actions 日志中排查
 *
 * 用法（GitHub Actions）：
 *   DOCKERHUB_USERNAME=xxx DOCKERHUB_TOKEN=yyy DOCKERHUB_REPOSITORY=namespace/repo \
 *   node scripts/sync-dockerhub-overview.js --readme README.md
 *
 * 参数：
 *   --readme <path>  README 路径（默认 README.md）
 */

import fs from "node:fs";

/**
 * @param {string[]} argv
 * @returns {{ readmePath: string; help: boolean }}
 */
const parseArgs = (argv) => {
  const args = argv.slice(2);
  const help = args.includes("--help") || args.includes("-h");

  const idx = args.indexOf("--readme");
  const readmePath = idx === -1 ? "README.md" : (args[idx + 1] ?? "README.md");

  return { readmePath, help };
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
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) => {
  return typeof value === "object" && value !== null;
};

/**
 * @param {string} repository
 * @param {string} fallbackNamespace
 * @returns {{ namespace: string; repo: string }}
 */
const parseDockerRepository = (repository, fallbackNamespace) => {
  const trimmed = repository.trim();
  if (!trimmed) return { namespace: "", repo: "" };

  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 1) return { namespace: fallbackNamespace.trim(), repo: parts[0].trim() };
  return { namespace: parts[0].trim(), repo: parts.slice(1).join("/").trim() };
};

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} url
 * @param {RequestInit} init
 * @param {{ retries: number; retryDelayMs: number }} options
 * @returns {Promise<Response>}
 */
const fetchWithRetry = async (url, init, options) => {
  const retries = Math.max(0, options.retries);
  const retryDelayMs = Math.max(0, options.retryDelayMs);

  /** @type {unknown} */
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;

      if (attempt === retries) return res;
      if (res.status >= 500 || res.status === 429) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Fetch failed");
};

const main = async () => {
  const { readmePath, help } = parseArgs(process.argv);

  if (help) {
    console.log("Usage: node scripts/sync-dockerhub-overview.js --readme README.md");
    process.exit(0);
  }

  const username = process.env.DOCKERHUB_USERNAME?.trim() ?? "";
  const tokenOrPassword = process.env.DOCKERHUB_TOKEN?.trim() ?? "";
  const repository = process.env.DOCKERHUB_REPOSITORY?.trim() ?? "";

  if (!exists(readmePath)) {
    console.log(`README not found: ${readmePath}`);
    process.exit(0);
  }

  if (!username || !tokenOrPassword || !repository) {
    console.log("Docker Hub secrets missing, skip syncing overview.");
    process.exit(0);
  }

  const { namespace, repo } = parseDockerRepository(repository, username);
  if (!namespace || !repo) {
    console.error(`Invalid DOCKERHUB_REPOSITORY: ${repository}`);
    process.exit(1);
  }

  const readme = fs.readFileSync(readmePath, "utf8");

  const loginUrl = "https://hub.docker.com/v2/users/login/";
  const loginRes = await fetchWithRetry(
    loginUrl,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: tokenOrPassword })
    },
    { retries: 5, retryDelayMs: 1000 }
  );

  if (!loginRes.ok) {
    const text = await loginRes.text();

    console.error(`Docker Hub login failed: ${loginRes.status} ${loginRes.statusText}\n${text}`);
    process.exit(1);
  }

  /** @type {unknown} */
  const loginJson = await loginRes.json();
  const jwt = isRecord(loginJson) && typeof loginJson.token === "string" ? loginJson.token : "";
  if (!jwt) {
    console.error("Failed to get Docker Hub JWT token from login response.");
    process.exit(1);
  }

  const patchUrl = `https://hub.docker.com/v2/repositories/${encodeURIComponent(namespace)}/${encodeURIComponent(repo)}/`;
  const patchRes = await fetchWithRetry(
    patchUrl,
    {
      method: "PATCH",
      headers: {
        Authorization: `JWT ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ full_description: readme })
    },
    { retries: 5, retryDelayMs: 1000 }
  );

  if (!patchRes.ok) {
    const text = await patchRes.text();

    console.error(
      `Docker Hub overview update failed: ${patchRes.status} ${patchRes.statusText}\n${text}`
    );
    process.exit(1);
  }

  console.log(`Synced README to Docker Hub overview: ${namespace}/${repo}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

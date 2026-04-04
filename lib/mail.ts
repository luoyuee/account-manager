/**
 * 邮件服务模块
 * 基于 Nodemailer 实现邮件发送功能
 * 
 * 配置要求（环境变量）：
 * - SMTP_HOST: SMTP 服务器地址
 * - SMTP_PORT: SMTP 端口（465 为 SSL，587 为 TLS）
 * - SMTP_USER: SMTP 用户名
 * - SMTP_PASS: SMTP 密码
 * - SMTP_FROM: 发件人地址（可选，默认使用 SMTP_USER）
 */
import nodemailer from "nodemailer";
import config from "@/config";

/**
 * 发送邮件选项
 */
export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * 创建 SMTP 传输器
 * 懒加载模式，每次发送邮件时创建新实例
 * 
 * @returns Nodemailer Transporter
 * @throws SMTP 配置缺失时抛出错误
 */
const createTransporter = () => {
  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    throw new Error("邮件服务未配置，请检查 SMTP 相关环境变量");
  }

  const port = Number.parseInt(config.SMTP_PORT, 10);

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
};

/**
 * 发送邮件
 * 
 * @param options - 邮件选项（收件人、主题、HTML 内容）
 * @returns 发送成功返回 true，失败返回 false
 */
export const sendMail = async (options: SendMailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const from = config.SMTP_FROM || config.SMTP_USER;

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error("Send mail error:", error);
    return false;
  }
};

/**
 * 发送密码重置邮件
 * 
 * @param email - 收件人邮箱
 * @param resetUrl - 密码重置链接
 * @returns 发送成功返回 true，失败返回 false
 */
export const sendResetPasswordMail = async (
  email: string,
  resetUrl: string,
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">重置密码</h2>
      <p>您好，</p>
      <p>我们收到了重置您账户密码的请求。请点击下方链接重置密码：</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
          重置密码
        </a>
      </p>
      <p>此链接将在 10 分钟后失效。</p>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
    </div>
  `;

  return sendMail({
    to: email,
    subject: "重置密码",
    html,
  });
};

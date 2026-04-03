import axios, { AxiosError } from "axios";

/**
 * Axios 请求实例配置
 * 统一处理请求/响应拦截、超时控制、错误处理
 */
export const serviceAxios = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

/**
 * 请求拦截器
 */
serviceAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * - 自动提取响应数据
 * - 统一处理错误消息
 * - 401 未授权自动跳转登录页
 */
serviceAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message || error.message || "请求失败";
    return Promise.reject(new Error(message));
  },
);

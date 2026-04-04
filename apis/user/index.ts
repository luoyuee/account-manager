import type { Response, Profile } from "@/types";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  UserListRequest,
  UserListResponse,
  CreateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserPasswordRequest,
} from "./models";
import { serviceAxios } from "@/utils/request";

export async function hasAdmin(): Promise<Response<{ hasAdmin: boolean }>> {
  return serviceAxios({
    method: "GET",
    url: `/auth/has-admin`,
  });
}

export async function register(
  data: RegisterRequest,
): Promise<Response<RegisterResponse>> {
  return serviceAxios({
    method: "POST",
    url: `/auth/register`,
    data,
  });
}

export async function login(
  data: LoginRequest,
): Promise<Response<LoginResponse>> {
  return serviceAxios({
    method: "POST",
    url: `/auth/login`,
    data,
  });
}

export async function logout(): Promise<Response<null>> {
  return serviceAxios({
    method: "POST",
    url: `/auth/logout`,
  });
}

export async function getProfile(): Promise<Response<Profile>> {
  return serviceAxios({
    method: "GET",
    url: `/user/profile`,
  });
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<Response<null>> {
  return serviceAxios({
    method: "POST",
    url: `/auth/reset-password`,
    data,
  });
}

export async function getUserList(
  params?: UserListRequest,
): Promise<Response<UserListResponse>> {
  return serviceAxios({
    method: "GET",
    url: `/user/list`,
    params,
  });
}

export async function createUser(
  data: CreateUserRequest,
): Promise<Response<null>> {
  return serviceAxios({
    method: "POST",
    url: `/user`,
    data,
  });
}

export async function updateUserStatus(
  id: number,
  data: UpdateUserStatusRequest,
): Promise<Response<null>> {
  return serviceAxios({
    method: "PUT",
    url: `/user/${id}/status`,
    data,
  });
}

export async function deleteUser(id: number): Promise<Response<null>> {
  return serviceAxios({
    method: "DELETE",
    url: `/user/${id}`,
  });
}

export async function updateUserPassword(
  id: number,
  data: UpdateUserPasswordRequest,
): Promise<Response<null>> {
  return serviceAxios({
    method: "PUT",
    url: `/user/${id}/password`,
    data,
  });
}

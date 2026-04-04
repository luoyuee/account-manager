export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UserListItem {
  id: number;
  username: string;
  nickname: string;
  email: string;
  avatar: string | null;
  role: number;
  status: number;
  created_at: string;
  last_login_at: string | null;
}

export interface UserListPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  list: UserListItem[];
  pagination: UserListPagination;
}

export interface UserListRequest {
  page?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserStatusRequest {
  status: number;
}

export interface UpdateUserPasswordRequest {
  password: string;
}

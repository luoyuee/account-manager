export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AccountBook {
  id: number;
  created_at: string;
  created_by: number;
  updated_at?: string;
  updated_by?: number;
  password: string;
  data: string;
  version: number;
  status: number;
}

export type AccountItem = {
  id: string;
  title: string;
  username: string;
  password: string;
  remark?: string;
  tags: string[];
};

export type AccountBookData = {
  accounts: AccountItem[];
};

export interface Profile {
  id: string;
  username: string;
  nickname: string | null;
  email: string;
  avatar: string | null;
  role: string;
  created_at: string;
  last_login_at: string | null;
}

import { AccountBook } from "@/types";

export type GetAccountBookResponse = AccountBook | null;

export interface CreateAccountBookRequest {
  password: string;
  data: string;
}

export type CreateAccountBookResponse = AccountBook;

export interface UpdateAccountBookRequest {
  id: number;
  data: string;
  version: number;
}

export type UpdateAccountBookResponse = AccountBook;

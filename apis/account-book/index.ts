import { serviceAxios } from "@/utils/request";
import { Response } from "@/types";
import {
  GetAccountBookResponse,
  CreateAccountBookRequest,
  CreateAccountBookResponse,
  UpdateAccountBookRequest,
  UpdateAccountBookResponse,
} from "./models";

export async function getAccountBook(): Promise<
  Response<GetAccountBookResponse>
> {
  return serviceAxios({
    url: "/account-book",
    method: "GET",
  });
}

export async function createAccountBook(
  data: CreateAccountBookRequest,
): Promise<Response<CreateAccountBookResponse>> {
  return serviceAxios({
    url: "/account-book",
    method: "POST",
    data,
  });
}

export async function updateAccountBook(
  data: UpdateAccountBookRequest,
): Promise<Response<UpdateAccountBookResponse>> {
  return serviceAxios({
    url: "/account-book",
    method: "PUT",
    data,
  });
}

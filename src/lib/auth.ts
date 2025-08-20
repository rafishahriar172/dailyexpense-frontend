import { api } from "./api";

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const loginUser = async (data: LoginData) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: RegisterData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

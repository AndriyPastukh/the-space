import api from "../../api";
import type { LoginDto, RegisterDto, Tokens, User } from "./authTypes";

export const loginRequest = (data: LoginDto) =>
  api.post<Tokens>("/auth/login", data);

export const registerRequest = (data: RegisterDto) =>
  api.post<Tokens>("/auth/register", data);

export const getMeRequest = (accessToken: string) =>
  api.get<User>("auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

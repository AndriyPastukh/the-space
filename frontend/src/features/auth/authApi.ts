import api from "../../api";
import type { LoginDto, RegisterDto, Tokens, User } from "./authTypes";

export const loginRequest = (data: LoginDto) =>
  api.post<Tokens>("/auth/login", data);

export const registerRequest = (data: RegisterDto) =>
  api.post<Tokens>("/auth/register", data);

export const logoutRequest = (tokens: Tokens) =>
  api.post("auth/logout", { refreshToken: tokens.refreshToken });

export const getMeRequest = () => api.get<User>("auth/me");

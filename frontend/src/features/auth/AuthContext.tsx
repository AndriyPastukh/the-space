import { createContext, useEffect, useState } from "react";

import type { AuthState, LoginDto, RegisterDto } from "./authTypes";
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "./authApi";

export const AuthContext = createContext<any>(null);

const initialState: AuthState = {
  user: null,
  isAuth: false,
  tokens: null,
  isAuthLoading: true,
  authError: null,
};

export const AuthProvider = ({ children }: any) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const initAuth = async () => {
      const tokensStr = localStorage.getItem("tokens");

      if (!tokensStr) {
        setState((prev) => ({ ...prev, isAuthLoading: false }));
        return;
      }

      try {
        const tokensAsObject = JSON.parse(tokensStr);

        // тягнемо дані юзера
        const userRes = await getMeRequest();
        const { email, id } = userRes.data;

        setState({
          user: { email, id },
          isAuth: true,
          tokens: tokensAsObject,
          isAuthLoading: false,
          authError: null,
        });
      } catch (error) {
        // Якщо токен невалідний або протух — очищаємо дані
        localStorage.removeItem("tokens");
        setState(initialState);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginDto) => {
    try {
      setState((prev) => ({ ...prev, isAuthLoading: true, authError: null }));

      const loginRes = await loginRequest(data);
      const { accessToken, refreshToken } = loginRes.data;

      localStorage.setItem(
        "tokens",
        JSON.stringify({ accessToken, refreshToken }),
      );

      const userDataRes = await getMeRequest();
      const { email, id } = userDataRes.data;

      setState({
        user: { email, id },
        isAuth: true,
        tokens: { accessToken, refreshToken },
        isAuthLoading: false,
        authError: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed";
      const errorMsg = Array.isArray(msg) ? msg[0] : msg;

      setState((prev) => ({
        ...prev,
        isAuthLoading: false,
        authError: err.response?.data?.message || "Login failed",
      }));

      return { success: false, message: errorMsg };
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      setState((prev) => ({ ...prev, isAuthLoading: true, authError: null }));

      const registerRes = await registerRequest(data);
      const { accessToken, refreshToken } = registerRes.data;

      localStorage.setItem(
        "tokens",
        JSON.stringify({ accessToken, refreshToken }),
      );

      const userRes = await getMeRequest();
      const { email, id } = userRes.data;

      setState({
        user: { email, id },
        isAuth: true,
        tokens: { accessToken, refreshToken },
        isAuthLoading: false,
        authError: null,
      });

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Register failed";
      const errorMsg = Array.isArray(msg) ? msg[0] : msg;

      setState((prev) => ({
        ...prev,
        isAuthLoading: false,
        authError: err.response?.data?.message || "Register failed",
      }));

      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    if (!state.tokens) return;

    try {
      await logoutRequest(state.tokens);
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("tokens");
    setState(initialState);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

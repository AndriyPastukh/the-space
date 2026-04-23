import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
});

api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("tokens");
  if (tokens) {
    try {
      const parsed = JSON.parse(tokens);
      if (parsed?.accessToken) {
        config.headers.Authorization = `Bearer ${parsed.accessToken}`;
      }
    } catch (e) {
      localStorage.removeItem("tokens");
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const tokensString = localStorage.getItem("tokens");
          if (!tokensString) throw new Error("No tokens");

          const { refreshToken } = JSON.parse(tokensString);

          const { data } = await axios.post<{
            accessToken: string;
            refreshToken: string;
          }>("http://localhost:3000/auth/refresh", { refreshToken });

          const { accessToken } = data;
          localStorage.setItem("tokens", JSON.stringify(data));

          // оновлюємо загальний заголовок
          api.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
          // оновлюємо заголовок поточного запиту
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem("tokens");
          window.location.href = "/login";
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  },
);

export default api;

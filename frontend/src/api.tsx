import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const tokensString = localStorage.getItem("tokens");
  if (tokensString) {
    try {
      const { accessToken } = JSON.parse(tokensString);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      localStorage.removeItem("tokens");
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: any; reject: any; config: any }[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const tokensString = localStorage.getItem("tokens");
          if (!tokensString) throw new Error("No tokens");

          const { refreshToken } = JSON.parse(tokensString);

          const { data } = await axios.post(
            `${api.defaults.baseURL}auth/refresh`,
            { refreshToken },
          );

          localStorage.setItem("tokens", JSON.stringify(data));

          api.defaults.headers.common["Authorization"] =
            `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          failedQueue.forEach(({ config, resolve, reject }) => {
            config.headers.Authorization = `Bearer ${data.accessToken}`;
            api.request(config).then(resolve).catch(reject);
          });
          failedQueue = [];

          return api(originalRequest);
        } catch (refreshError) {
          failedQueue.forEach(({ reject }) => reject(refreshError));
          failedQueue = [];

          localStorage.removeItem("tokens");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    return Promise.reject(error);
  },
);

export default api;

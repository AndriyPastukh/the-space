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

export default api;

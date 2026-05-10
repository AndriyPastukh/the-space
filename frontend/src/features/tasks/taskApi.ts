import api from "../../api";

export type CreateTaskPayload = {
  title: string;
  categories: number[];
  description: string;
  deadline: string;
  urls: string[];
  files: File[];
};

export const createTask = (payload: CreateTaskPayload) => {
  return api.post("/api/tasks", payload);
};

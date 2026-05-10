import api from "../../api";

export type CreateTaskPayload = {
  title: string;
  categories: number[];
  description: string;
  deadline: string;
  urls: string[];
  files: File[];
};

export type GetTasksParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  categoryIds?: number[];
  signal?: AbortSignal;
};

export const createTask = (payload: CreateTaskPayload) => {
  return api.post("/api/tasks", payload);
};

export const getTasks = ({
  page,
  limit,
  search,
  sortBy,
  categoryIds = [],
  signal,
}: GetTasksParams) => {
  const params = new URLSearchParams();

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);

  categoryIds.forEach((id) => {
    params.append("categoryId", id.toString());
  });

  return api.get(`/api/tasks?${params.toString()}`, { signal });
};

export const getTaskById = (id: string, signal?: AbortSignal) => {
  return api.get(`/api/tasks/${id}`, { signal });
};
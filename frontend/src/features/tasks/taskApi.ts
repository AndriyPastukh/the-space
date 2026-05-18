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
  authorId?: number;
  assigneeId?: number;
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
  authorId,
  assigneeId,
  signal,
}: GetTasksParams) => {
  const params = new URLSearchParams();

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (authorId) params.append("authorId", authorId.toString());
  if (assigneeId) params.append("assigneeId", assigneeId.toString());

  categoryIds.forEach((id) => {
    params.append("categoryId", id.toString());
  });

  return api.get(`/api/tasks?${params.toString()}`, { signal });
};

export const getTaskById = (id: string, signal?: AbortSignal) => {
  return api.get(`/api/tasks/${id}`, { signal });
};

export const applyToTask = (id: string, message?: string) => {
  return api.post(`/api/tasks/${id}/apply`, { message });
};

export const respondToProposal = (taskId: string, proposalId: string, status: 'APPROVED' | 'REJECTED') => {
  return api.patch(`/api/tasks/${taskId}/proposals/${proposalId}`, { status });
};

export const getMyRespondedTasks = (params: { page: number; limit: number }) => {
  return api.get(`/api/tasks/my-responded?page=${params.page}&limit=${params.limit}`);
};

export const deleteTask = (id: string) => {
  return api.delete(`/api/tasks/${id}`);
};

export const updateTask = (id: string, payload: Partial<CreateTaskPayload> & { status?: string }) => {
  return api.patch(`/api/tasks/${id}`, payload);
};

export const completeTask = (id: string) => {
  return api.patch(`/api/tasks/${id}/complete`);
};

export const submitTaskReview = (id: string, rating: number, comment?: string) => {
  return api.post(`/api/tasks/${id}/review`, { rating, comment });
};
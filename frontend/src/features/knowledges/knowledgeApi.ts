import api from "../../api";

export type CreateKnowledgePayload = {
  offerCategories: number[];
  offerDescription: string;
  requestCategories: number[];
  requestDescription: string;
  deadline: string;
  urls: string[];
  files: File[];
};

export type GetKnowledgesParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  offerCategoryIds?: number[];
  requestCategoryIds?: number[];
  signal?: AbortSignal;
};

export const createKnowledge = (payload: CreateKnowledgePayload) => {
  return api.post("/api/knowledge", payload);
};

export const getKnowledges = ({
  page,
  limit,
  search,
  sortBy,
  offerCategoryIds = [],
  requestCategoryIds = [],
  signal,
}: GetKnowledgesParams) => {
  const params = new URLSearchParams();

  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);

  offerCategoryIds.forEach(id => {
    params.append("offerCategoryId", id.toString());
  });

  requestCategoryIds.forEach(id => {
    params.append("requestCategoryId", id.toString());
  });

  return api.get(`/api/knowledge?${params.toString()}`, { signal });
};

export const getKnowledgeById = (id: string, signal?: AbortSignal) => {
  return api.get(`/api/knowledge/${id}`, { signal });
};
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

export const createKnowledge = (payload: CreateKnowledgePayload) => {
  return api.post("/api/knowledge", payload);
};

import api from "../../api";

export type Category = {
  id: number;
  name: string;
};

export const getCategories = () => {
  return api.get<Category[]>("/api/categories");
};

export const createCategory = (name: string) => {
  return api.post<Category>("/api/categories", { name });
};

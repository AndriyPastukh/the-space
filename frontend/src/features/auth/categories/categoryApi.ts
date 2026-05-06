import api from "../../../api";

export type Category = {
  id: number;
  name: string;
};

export const getCategories = () => {
  return api.get<Category[]>("/categories");
};

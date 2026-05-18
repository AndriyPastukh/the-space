import { useEffect, useState } from "react";
import {
  getCategories,
  type Category,
} from "../features/categories/categoryApi";

export const useCategories = (enabled = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не вдалося завантажити категорії",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    fetchCategories();
  }, [enabled]);

  return {
    categories,
    isLoading,
    error,
    getCategories: fetchCategories,
  };
};

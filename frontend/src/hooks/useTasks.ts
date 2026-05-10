import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getTasks } from "../features/tasks/taskApi";

type UseTasksParams = {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  categoryIds: number[];
  enabled?: boolean;
};

const mapTask = (item: any) => {
  const authorInfo = {
    id: item.author.id,
    name:
      item.author.userDetails?.nickname || item.author.email || "Користувач",
    avatarUrl: item.author.userDetails?.avatarUrl || "",
    rating: 0,
    reviewsCount: 0,
  };

  return {
    ...item,
    type: "TASK",
    author: authorInfo,
    statistics: { viewsCount: 0, proposalsCount: 0 },
    viewer: { isSaved: false, myProposalId: null },
  };
};

export const useTasks = ({
  page,
  limit,
  search,
  sortBy,
  categoryIds,
  enabled = true,
}: UseTasksParams) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchTasks = async () => {
      setIsLoading(true);

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data: result } = await getTasks({
          page,
          limit,
          search,
          sortBy,
          categoryIds,
          signal: controller.signal,
        });

        const mappedItems = result.items.map(mapTask);

        setData(mappedItems);
        setTotalItems(result.total ?? result.items.length);
        setTotalPages(
          result.totalPages ??
            Math.ceil((result.total ?? result.items.length) / limit),
        );
      } catch (error: any) {
        if (axios.isCancel(error)) return;
        console.error("Помилка при завантаженні задач:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTasks, 300);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [page, limit, search, sortBy, categoryIds, enabled]);

  return {
    data,
    isLoading,
    totalPages,
    totalItems,
  };
};

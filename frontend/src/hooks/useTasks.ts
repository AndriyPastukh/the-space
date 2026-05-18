import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getTasks } from "../features/tasks/taskApi";

type UseTasksParams = {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  categoryIds: number[];
  authorId?: number;
  assigneeId?: number;
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

  const applications = (item.proposals || []).map((p: any) => ({
    id: p.id,
    applicant: {
      firstName: p.userDetails.firstName,
      lastName: p.userDetails.lastName,
      avatarUrl: p.userDetails.avatarUrl,
      rating: p.userDetails.reputation || 0,
    },
    status: p.status,
    appliedAt: p.createdAt,
  }));

  return {
    ...item,
    type: "TASK",
    author: authorInfo,
    categories: item.categories || [],
    tags: item.categories?.map((c: any) => c.name) || [],
    applications,
    statistics: { viewsCount: 0, proposalsCount: applications.length },
    viewer: { isSaved: false, myProposalId: null },
  };
};

export const useTasks = ({
  page,
  limit,
  search,
  sortBy,
  categoryIds,
  authorId,
  assigneeId,
  enabled = true,
}: UseTasksParams) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

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
          authorId,
          assigneeId,
          signal: controller.signal,
        });

        const mappedItems = result.items.map(mapTask);

        setData(mappedItems);
        setTotalItems(result.total ?? result.items.length);
        setTotalPages(
          result.totalPages ??
            Math.ceil((result.total ?? result.items.length) / limit),
        );
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        console.error("Помилка при завантаженні задач:", err);
        setError(err.response?.data?.message || "Помилка при завантаженні задач");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchTasks, 300);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [page, limit, search, sortBy, categoryIds, authorId, assigneeId, enabled]);

  return {
    data,
    isLoading,
    error,
    totalPages,
    totalItems,
  };
};

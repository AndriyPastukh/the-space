import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getTasks, getMyRespondedTasks } from "../features/tasks/taskApi";
import { isTaskSaved } from "../features/tasks/savedTaskStorage";
import { useAuth } from "./useAuth";

type UseTasksParams = {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  categoryIds: number[];
  authorId?: number;
  assigneeId?: number;
  respondedOnly?: boolean;
  enabled?: boolean;
};

const mapTask = (item: any, currentUserId?: number | null) => {
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
      id: p.userDetails.userId,
      firstName: p.userDetails.firstName,
      lastName: p.userDetails.lastName,
      avatarUrl: p.userDetails.avatarUrl,
      rating: p.userDetails.reputation || 0,
    },
    status: p.status,
    appliedAt: p.createdAt,
    message: p.message,
  }));

  const myProposal = currentUserId
    ? item.proposals?.find((p: any) => p.userDetails?.userId === currentUserId && p.status === "PENDING")
    : null;

  return {
    ...item,
    type: "TASK",
    author: authorInfo,
    assignee: item.assignee
      ? {
          id: item.assignee.id,
          name:
            item.assignee.userDetails?.nickname ||
            item.assignee.email ||
            "Користувач",
          avatarUrl: item.assignee.userDetails?.avatarUrl || "",
          rating: item.assignee.userDetails?.reputation || 0,
        }
      : null,
    categories: item.categories || [],
    tags: item.categories?.map((c: any) => c.name) || [],
    applications,
    statistics: { viewsCount: 0, proposalsCount: applications.length },
    viewer: {
      isSaved: isTaskSaved(item.id),
      myProposalId: myProposal ? myProposal.id : null,
    },
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
  respondedOnly = false,
  enabled = true,
}: UseTasksParams) => {
  const { user } = useAuth();
  const currentUserId = user?.id ? Number(user.id) : null;
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let resultData;
        if (respondedOnly) {
          const { data: result } = await getMyRespondedTasks({ page, limit });
          resultData = result;
        } else {
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
          resultData = result;
        }

        const mappedItems = resultData.items.map((item: any) => mapTask(item, currentUserId));

        setData(mappedItems);
        setTotalItems(resultData.total ?? resultData.items.length);
        setTotalPages(
          resultData.totalPages ??
            Math.ceil((resultData.total ?? resultData.items.length) / limit),
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
  }, [page, limit, search, sortBy, categoryIds, authorId, assigneeId, respondedOnly, enabled, reloadToken]);

  return {
    data,
    isLoading,
    error,
    totalPages,
    totalItems,
    reload: () => setReloadToken((current) => current + 1),
  };
};

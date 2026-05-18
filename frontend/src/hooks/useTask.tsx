import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getTaskById } from "../features/tasks/taskApi";
import { isTaskSaved } from "../features/tasks/savedTaskStorage";

const mapTaskDetails = (item: any) => {
  const authorInfo = {
    id: item.author.id,
    name:
      item.author.userDetails?.nickname || item.author.email || "Користувач",
    avatarUrl: item.author.userDetails?.avatarUrl || "",
    rating: item.author.userDetails?.reputation || 0,
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
    appliedAt: p.createdAt, message: p.message,
  }));

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
          reviewsCount: 0,
        }
      : null,
    applications,
    statistics: {
      viewsCount: 0,
      proposalsCount: applications.length,
    },
    viewer: {
      isSaved: isTaskSaved(item.id),
      myProposalId: null,
    },
  };
};

type UseTaskParams = {
  id?: string;
  enabled?: boolean;
};

export const useTask = ({ id, enabled = true }: UseTaskParams) => {
  const [task, setTask] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !id) return;

    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data } = await getTaskById(id, controller.signal);
        setTask(mapTaskDetails(data));
      } catch (error: any) {
        if (axios.isCancel(error)) return;

        console.error("Помилка при завантаженні задачі:", error);

        const message = error.response?.data?.message;

        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Задачу не знайдено або не вдалося завантажити",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [id, enabled, reloadToken]);

  return {
    task,
    isLoading,
    error,
    reload: () => setReloadToken((prev) => prev + 1),
  };
};

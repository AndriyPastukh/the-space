import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getTaskById } from "../features/tasks/taskApi";

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
    applications,
    statistics: {
      viewsCount: 0,
      proposalsCount: applications.length,
    },
    viewer: {
      isSaved: false,
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
  }, [id, enabled]);

  return {
    task,
    isLoading,
    error,
  };
};

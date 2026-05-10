import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getKnowledgeById } from "../features/knowledges/knowledgeApi";

type UseKnowledgeParams = {
  id?: string;
  enabled?: boolean;
};

const mapKnowledgeDetails = (item: any) => {
  const authorInfo = {
    id: item.author?.id,
    name:
      item.author?.userDetails?.nickname || item.author?.email || "Користувач",
    avatarUrl: item.author?.userDetails?.avatarUrl || "",
    rating: 0,
    reviewsCount: 0,
  };

  return {
    ...item,
    type: "KNOWLEDGE",
    status: item.status ?? "OPEN",
    offerCategories: item.offerCategories || [],
    requestCategories: item.requestCategories || [],
    files: item.files || [],
    urls: item.urls || [],
    author: authorInfo,
    statistics: {
      viewsCount: 0,
      proposalsCount: 0,
    },
    viewer: {
      isSaved: false,
      myProposalId: null,
    },
  };
};

export const useKnowledge = ({ id, enabled = true }: UseKnowledgeParams) => {
  const [knowledge, setKnowledge] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || !id) return;

    const fetchKnowledge = async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data } = await getKnowledgeById(id, controller.signal);
        setKnowledge(mapKnowledgeDetails(data));
      } catch (error: any) {
        if (axios.isCancel(error)) return;

        console.error("Помилка при завантаженні knowledge:", error);

        const message = error.response?.data?.message;

        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Знання не знайдено або не вдалося завантажити",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledge();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [id, enabled]);

  return {
    knowledge,
    isLoading,
    error,
  };
};

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getKnowledges } from "../features/knowledges/knowledgeApi";

type UseKnowledgesParams = {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  offerCategoryIds: number[];
  requestCategoryIds: number[];
  authorId?: number;
  enabled?: boolean;
};

const mapKnowledge = (item: any) => {
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
    type: "KNOWLEDGE",
    offer: {
      categories: item.offerCategories || [],
      tags: (item.offerCategories || []).map((c: any) => c.name),
      description: item.offerDescription,
    },
    want: {
      categories: item.requestCategories || [],
      tags: (item.requestCategories || []).map((c: any) => c.name),
      description: item.requestDescription,
    },
    author: authorInfo,
    statistics: { viewsCount: 0, proposalsCount: 0 },
    viewer: { isSaved: false, myProposalId: null },
  };
};

export const useKnowledges = ({
  page,
  limit,
  search,
  sortBy,
  offerCategoryIds,
  requestCategoryIds,
  authorId,
  enabled = true,
}: UseKnowledgesParams) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);

    const fetchKnowledges = async () => {
      setIsLoading(true);
      setError(null);

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data: result } = await getKnowledges({
          page,
          limit,
          search,
          sortBy,
          offerCategoryIds,
          requestCategoryIds,
          authorId,
          signal: controller.signal,
        });

        const mappedItems = result.items.map(mapKnowledge);

        setData(mappedItems);
        setTotalItems(result.total ?? result.items.length);
        setTotalPages(
          result.totalPages ??
            Math.ceil((result.total ?? result.items.length) / limit),
        );
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        console.error("Помилка при завантаженні знань:", err);
        setError(err.response?.data?.message || "Помилка при завантаженні знань");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchKnowledges, 300);

    return () => {
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [
    enabled,
    page,
    limit,
    search,
    sortBy,
    offerCategoryIds,
    requestCategoryIds,
    authorId,
  ]);

  return {
    data,
    isLoading,
    error,
    totalPages,
    totalItems,
  };
};

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import type { FilterPanelSection } from "../../components/FilterPanel/types";
import { useCategories } from "../../hooks/useCategories";
import { useKnowledges } from "../../hooks/useKnowledges";
import { useTasks } from "../../hooks/useTasks";
import Pagination from "../SearchSpacePage/components/Pagination/Pagination";
import KnowledgeCard from "./components/KnowledgeCard/KnowledgeCard";
import SearchBar from "./components/SearchBar/SearchBar";
import TaskCard from "./components/TaskCard/TaskCard";
import "./SearchPage.css";

const PAGE_LIMIT = 10;

type TabType = "TASK" | "KNOWLEDGE";

interface FilterState {
  tab: TabType;
  categoryIds: number[];
  offerCategoryIds: number[];
  requestCategoryIds: number[];
  sortBy: string;
}

const getInitialTabFromUrl = (type: string | null): TabType => {
  if (type === "knowledge") return "KNOWLEDGE";
  return "TASK";
};

const mapCategoriesToFilterItems = (
  categories: Array<{ id: number; name: string }>,
) =>
  categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

const toggleArrayValue = <T,>(items: T[], value: T) =>
  items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCategories(filterOpen);

  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [page, setPage] = useState(() => {
    const pageFromUrl = Number(searchParams.get("page"));
    return Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  });

  const [filterState, setFilterState] = useState<FilterState>(() => ({
    tab: getInitialTabFromUrl(searchParams.get("type")),
    categoryIds: [],
    offerCategoryIds: [],
    requestCategoryIds: [],
    sortBy: "createdAt",
  }));

  const isTaskTab = filterState.tab === "TASK";

  const tasks = useTasks({
    page,
    limit: PAGE_LIMIT,
    search,
    sortBy: filterState.sortBy,
    categoryIds: filterState.categoryIds,
    enabled: filterState.tab === "TASK",
  });

  const knowledges = useKnowledges({
    page,
    limit: PAGE_LIMIT,
    search,
    sortBy: filterState.sortBy,
    offerCategoryIds: filterState.offerCategoryIds,
    requestCategoryIds: filterState.requestCategoryIds,
    enabled: filterState.tab === "KNOWLEDGE",
  });

  const current = isTaskTab ? tasks : knowledges;

  const updateSearchParams = (nextValues: {
    tab?: TabType;
    search?: string;
    page?: number;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextValues.tab) {
      nextParams.set("type", nextValues.tab === "TASK" ? "task" : "knowledge");
    }

    if (nextValues.search !== undefined) {
      const normalizedSearch = nextValues.search.trim();

      if (normalizedSearch) {
        nextParams.set("search", normalizedSearch);
      } else {
        nextParams.delete("search");
      }
    }

    if (nextValues.page !== undefined) {
      if (nextValues.page > 1) {
        nextParams.set("page", String(nextValues.page));
      } else {
        nextParams.delete("page");
      }
    }

    setSearchParams(nextParams);
  };

  useEffect(() => {
    const tabFromUrl = getInitialTabFromUrl(searchParams.get("type"));
    const searchFromUrl = searchParams.get("search") ?? "";
    const pageFromUrl = Number(searchParams.get("page"));
    const safePage =
      Number.isInteger(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

    setSearch(searchFromUrl);
    setPage(safePage);

    setFilterState((prev) => {
      if (prev.tab === tabFromUrl) return prev;

      return {
        ...prev,
        tab: tabFromUrl,
        categoryIds: [],
        offerCategoryIds: [],
        requestCategoryIds: [],
      };
    });
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);

    updateSearchParams({
      search: value,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    updateSearchParams({
      page: newPage,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(newState);
    setPage(1);

    updateSearchParams({
      tab: newState.tab,
      page: 1,
    });
  };

  const clearFilters = () => {
    handleFilterChange({
      ...filterState,
      categoryIds: [],
      offerCategoryIds: [],
      requestCategoryIds: [],
    });
  };

  const toggleTaskCategory = (categoryId: number) => {
    handleFilterChange({
      ...filterState,
      categoryIds: toggleArrayValue(filterState.categoryIds, categoryId),
    });
  };

  const toggleOfferCategory = (categoryId: number) => {
    handleFilterChange({
      ...filterState,
      offerCategoryIds: toggleArrayValue(
        filterState.offerCategoryIds,
        categoryId,
      ),
    });
  };

  const toggleRequestCategory = (categoryId: number) => {
    handleFilterChange({
      ...filterState,
      requestCategoryIds: toggleArrayValue(
        filterState.requestCategoryIds,
        categoryId,
      ),
    });
  };

  const handleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id)
        ? prev.filter((savedId) => savedId !== id)
        : [...prev, id],
    );
  };

  const showPagination = !current.isLoading && current.totalPages > 1;
  const hasSelectedFilters =
    filterState.categoryIds.length > 0 ||
    filterState.offerCategoryIds.length > 0 ||
    filterState.requestCategoryIds.length > 0;

  const categoryItems = mapCategoriesToFilterItems(categories);

  const filterSections: FilterPanelSection[] = isCategoriesLoading
    ? [
        {
          type: "message",
          text: "Завантаження...",
          variant: "loading",
        },
      ]
    : categoriesError
      ? [
          {
            type: "message",
            text: categoriesError,
            variant: "error",
          },
        ]
      : filterState.tab === "TASK"
        ? [
            {
              type: "chips",
              label: "Категорії",
              items: categoryItems,
              isSelected: (value) =>
                filterState.categoryIds.includes(Number(value)),
              onClick: (value) => toggleTaskCategory(Number(value)),
              action: {
                label: "Скинути фільтри",
                onClick: clearFilters,
                visible: hasSelectedFilters,
              },
            },
          ]
        : [
            {
              type: "chips",
              label: "Пропоную",
              items: categoryItems,
              isSelected: (value) =>
                filterState.offerCategoryIds.includes(Number(value)),
              onClick: (value) => toggleOfferCategory(Number(value)),
              action: {
                label: "Скинути фільтри",
                onClick: clearFilters,
                visible: hasSelectedFilters,
              },
            },
            {
              type: "chips",
              label: "Шукаю",
              items: categoryItems,
              isSelected: (value) =>
                filterState.requestCategoryIds.includes(Number(value)),
              onClick: (value) => toggleRequestCategory(Number(value)),
            },
          ];

  return (
    <div className="search-page">
      <div className="search-page-container">
        <h1 className="search-space-title">Пошук досвіду</h1>

        <div className="search-tabs">
          <button
            className={`search-tab ${filterState.tab === "TASK" ? "search-tab--active" : ""}`}
            onClick={() => {
              updateSearchParams({ tab: "TASK", page: 1 });
            }}
          >
            Завдання
          </button>
          <button
            className={`search-tab ${filterState.tab === "KNOWLEDGE" ? "search-tab--active" : ""}`}
            onClick={() => {
              updateSearchParams({ tab: "KNOWLEDGE", page: 1 });
            }}
          >
            Знання
          </button>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onFilterToggle={() => setFilterOpen((prev) => !prev)}
          filterOpen={filterOpen}
          sortBy={filterState.sortBy}
          onSortChange={(value) =>
            handleFilterChange({ ...filterState, sortBy: value })
          }
        />

        <div
          className={`search-layout ${filterOpen ? "search-layout--open" : ""}`}
        >
          {filterOpen && (
            <aside className="search-sidebar">
              <FilterPanel
                className="search-filter-panel"
                sections={filterSections}
              />
            </aside>
          )}

          <div className="search-results">
            {current.isLoading ? (
              <div className="search-empty">
                <p>Завантаження...</p>
              </div>
            ) : current.data.length === 0 ? (
              <div className="search-empty">
                <span className="search-empty-icon">🔍</span>
                <p>Нічого не знайдено у {filterState.tab}</p>
                <span>Спробуй змінити запит або фільтри</span>
              </div>
            ) : (
              <>
                {current.data.map((item) => {
                  if (item.type === "TASK") {
                    return <TaskCard key={item.id} {...item} />;
                  }

                  return (
                    <KnowledgeCard
                      key={item.id}
                      {...item}
                      viewer={{
                        ...item.viewer,
                        isSaved: savedIds.includes(item.id),
                      }}
                      onSave={handleSave}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>

        {showPagination && (
          <div className="pagination-container">
            <span className="pagination__info">
              Показано на сторінці {current.data.length} з {current.totalItems}
            </span>

            <Pagination
              currentPage={page}
              totalPages={current.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "./components/SearchBar/SearchBar";
import FilterPanel from "./components/FilterPanel/FilterPanel";
import TaskCard from "./components/TaskCard/TaskCard";
import KnowledgeCard from "./components/KnowledgeCard/KnowledgeCard";
import Pagination from "../SearchSpacePage/components/Pagination/Pagination";
import type {
  FilterState,
  TabType,
} from "./components/FilterPanel/FilterPanel";
import { useTasks } from "../../hooks/useTasks";
import { useKnowledges } from "../../hooks/useKnowledges";
import "./SearchPage.css";

const PAGE_LIMIT = 10;

const getInitialTabFromUrl = (type: string | null): TabType => {
  if (type === "knowledge") return "KNOWLEDGE";
  return "TASK";
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    const tabFromUrl = getInitialTabFromUrl(searchParams.get("type"));

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

  useEffect(() => {
    setPage(1);
  }, [search, filterState]);

  const updateUrlType = (tab: TabType) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("type", tab === "TASK" ? "task" : "knowledge");

    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(newState);

    if (newState.tab !== filterState.tab) {
      updateUrlType(newState.tab);
    }
  };

  const handleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id)
        ? prev.filter((savedId) => savedId !== id)
        : [...prev, id],
    );
  };

  const showPagination = !current.isLoading && current.totalPages > 1;

  return (
    <div className="search-page">
      <div className="search-page-container">
        <SearchBar
          value={search}
          onChange={setSearch}
          onFilterToggle={() => setFilterOpen((prev) => !prev)}
          filterOpen={filterOpen}
          sortBy={filterState.sortBy}
          onSortChange={(val) =>
            handleFilterChange({ ...filterState, sortBy: val })
          }
        />

        <div
          className={`search-layout ${filterOpen ? "search-layout--open" : ""}`}
        >
          {filterOpen && (
            <aside className="search-sidebar">
              <FilterPanel
                filterState={filterState}
                onChange={handleFilterChange}
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
                <p>Нічого не знайдено</p>
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

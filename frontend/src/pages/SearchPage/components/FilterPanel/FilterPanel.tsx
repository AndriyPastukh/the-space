import { useCategories } from "../../../../hooks/useCategories";
import "./FilterPanel.css";

export type TabType = "TASK" | "KNOWLEDGE";

export interface FilterState {
  tab: TabType;
  categoryIds: number[];
  offerCategoryIds: number[];
  requestCategoryIds: number[];
  sortBy: string;
}

interface FilterPanelProps {
  filterState: FilterState;
  onChange: (state: FilterState) => void;
}

export default function FilterPanel({ filterState, onChange }: FilterPanelProps) {
  const { categories, isLoading, error } = useCategories();

  const isTaskTab = filterState.tab === "TASK";
  const isKnowledgeTab = filterState.tab === "KNOWLEDGE";

  const toggleTaskCategory = (categoryId: number) => {
    const updated = filterState.categoryIds.includes(categoryId)
      ? filterState.categoryIds.filter(id => id !== categoryId)
      : [...filterState.categoryIds, categoryId];

    onChange({ ...filterState, categoryIds: updated });
  };

  const toggleOfferCategory = (categoryId: number) => {
    const updated = filterState.offerCategoryIds.includes(categoryId)
      ? filterState.offerCategoryIds.filter(id => id !== categoryId)
      : [...filterState.offerCategoryIds, categoryId];

    onChange({ ...filterState, offerCategoryIds: updated });
  };

  const toggleRequestCategory = (categoryId: number) => {
    const updated = filterState.requestCategoryIds.includes(categoryId)
      ? filterState.requestCategoryIds.filter(id => id !== categoryId)
      : [...filterState.requestCategoryIds, categoryId];

    onChange({ ...filterState, requestCategoryIds: updated });
  };



  const clearFilters = () => {
    onChange({
      ...filterState,
      categoryIds: [],
      offerCategoryIds: [],
      requestCategoryIds: [],
    });
  };

  const hasSelectedFilters =
    filterState.categoryIds.length > 0 ||
    filterState.offerCategoryIds.length > 0 ||
    filterState.requestCategoryIds.length > 0;

  return (
    <div className="filter-panel">


      {isLoading ? (
        <div className="filter-section">
          <span className="filter-section-loading">Завантаження...</span>
        </div>
      ) : error ? (
        <div className="filter-section">
          <span className="filter-section-error">{error}</span>
        </div>
      ) : (
        <>
          {isTaskTab && (
            <div className="filter-section">
              <span className="filter-section-label">Категорії</span>

              <div className="filter-chips">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-chip ${
                      filterState.categoryIds.includes(cat.id)
                        ? "filter-chip--active"
                        : ""
                    }`}
                    onClick={() => toggleTaskCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isKnowledgeTab && (
            <>
              <div className="filter-section">
                <span className="filter-section-label">Пропоную</span>

                <div className="filter-chips">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`filter-chip ${
                        filterState.offerCategoryIds.includes(cat.id)
                          ? "filter-chip--active"
                          : ""
                      }`}
                      onClick={() => toggleOfferCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <span className="filter-section-label">Шукаю</span>

                <div className="filter-chips">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`filter-chip ${
                        filterState.requestCategoryIds.includes(cat.id)
                          ? "filter-chip--active"
                          : ""
                      }`}
                      onClick={() => toggleRequestCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {hasSelectedFilters && (
        <button type="button" className="filter-clear" onClick={clearFilters}>
          Скинути фільтри
        </button>
      )}
    </div>
  );
}
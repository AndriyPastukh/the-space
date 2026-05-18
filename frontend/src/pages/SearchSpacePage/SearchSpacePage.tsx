import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import type { FilterPanelSection } from "../../components/FilterPanel/types";
import api from "../../api";
import { communitiesApi } from "../../features/communities/communitiesApi";
import { teamsApi } from "../../features/teams/teamsApi";
import Pagination from "./components/Pagination/Pagination";
import PersonCard from "./components/PersonCard/PersonCard";
import type { PersonCardProps } from "./components/PersonCard/PersonCard";
import SpaceCard from "./components/SpaceCard/SpaceCard";
import "./SearchSpacePage.css";

const ITEMS_PER_PAGE = 6;

type FilterTab = "PEOPLE" | "SPACES";

interface FilterState {
  tab: FilterTab;
  directions: string[];
  myInterests: boolean;
  spaceType: "all" | "COMMUNITY" | "TEAM";
}

const initialFilter: FilterState = {
  tab: "PEOPLE",
  directions: [],
  myInterests: false,
  spaceType: "all",
};

const SORT_OPTIONS = [
  { value: "rating_desc", label: "За спаданням рейтингу" },
  { value: "rating_asc", label: "За зростанням рейтингу" },
  { value: "members_desc", label: "За спаданням учасників" },
  { value: "members_asc", label: "За зростанням учасників" },
];

interface ApiUser {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  bio?: string | null;
  directions?: string[] | null;
  interests?: string[] | null;
}

interface ApiCategory {
  id: number;
  name: string;
}

interface ApiTag {
  id: string;
  name: string;
}

interface SearchSpace {
  id: string;
  type: "COMMUNITY" | "TEAM";
  name: string;
  slug: string;
  avatarUrl: string;
  rating: number;
  memberCount: number;
  directions: string[];
  description: string;
}

const mapValuesToFilterItems = (values: string[], prefix = "") =>
  values.map((value) => ({
    label: `${prefix}${value}`,
    value,
  }));

export default function SearchSpacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const activeTab =
    typeParam === "user" || typeParam === "community" || typeParam === "team"
      ? typeParam
      : "user";

  const [people, setPeople] = useState<PersonCardProps[]>([]);
  const [spaces, setSpaces] = useState<SearchSpace[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(initialFilter);
  const [sort, setSort] = useState("rating_desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilterState((prev) => ({
      ...prev,
      tab: activeTab === "user" ? "PEOPLE" : "SPACES",
    }));
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get<ApiUser[]>("/api/users"),
      api.get<ApiCategory[]>("/api/categories"),
      api.get<ApiTag[]>("/api/tags"),
      communitiesApi.findAll({ limit: 100 }),
      teamsApi.findAll({ limit: 100 }),
    ])
      .then(([usersRes, catsRes, tagsRes, commsRes, teamsRes]) => {
        if (!isMounted) return;

        const mappedUsers = usersRes.data.map((person) => ({
          id: String(person.id),
          firstName: person.firstName || "",
          lastName: person.lastName || "",
          nickname: person.nickname || "",
          avatarUrl: person.avatarUrl || "",
          rating: person.rating || 0.0,
          bio: person.bio || "",
          directions: person.directions || [],
          interests: person.interests || [],
        }));

        const mappedCommunities = (commsRes.items || []).map((community) => ({
          id: String(community.id),
          type: "COMMUNITY" as const,
          name: community.name,
          slug: community.slug,
          avatarUrl: community.avatarUrl ?? "",
          rating: 4.5,
          memberCount: community.memberCount || 0,
          directions:
            community.directions?.map((direction: any) => direction.name) || [],
          description: community.description || "",
        }));

        const mappedTeams = (teamsRes.items || []).map((team) => ({
          id: String(team.id),
          type: "TEAM" as const,
          name: team.name,
          slug: team.slug,
          avatarUrl: team.avatarUrl ?? "",
          rating: 4.5,
          memberCount: team.memberCount || 0,
          directions:
            team.directions?.map((direction: any) => direction.name) || [],
          description: team.description || "",
        }));

        setPeople(mappedUsers);
        setSpaces([...mappedCommunities, ...mappedTeams]);
        setCategories(catsRes.data.map((category) => category.name));
        setTags(tagsRes.data.map((tag) => tag.name));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch search page data:", error);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (newState: FilterState) => {
    setFilterState(newState);
    setPage(1);
  };

  const handleReset = () => {
    setFilterState(initialFilter);
    setSearch("");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (activeTab === "user") {
      return people
        .filter((person) => {
          const fullName =
            `${person.firstName} ${person.lastName}`.toLowerCase();
          if (
            query &&
            !fullName.includes(query) &&
            !person.bio.toLowerCase().includes(query) &&
            !person.nickname.toLowerCase().includes(query)
          ) {
            return false;
          }

          if (filterState.directions.length > 0) {
            const hasDirectionMatch = filterState.directions.some((direction) =>
              person.directions.includes(direction),
            );
            if (!hasDirectionMatch) return false;
          }

          return true;
        })
        .sort((a, b) => {
          if (sort === "rating_asc") return a.rating - b.rating;
          return b.rating - a.rating;
        });
    }

    const targetType = activeTab === "community" ? "COMMUNITY" : "TEAM";

    return spaces
      .filter((space) => {
        if (space.type !== targetType) return false;
        if (
          query &&
          !space.name.toLowerCase().includes(query) &&
          !space.description.toLowerCase().includes(query)
        ) {
          return false;
        }

        if (filterState.directions.length > 0) {
          const hasDirectionMatch = filterState.directions.some((direction) =>
            space.directions.includes(direction),
          );
          if (!hasDirectionMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "rating_asc") return a.rating - b.rating;
        if (sort === "members_desc") return b.memberCount - a.memberCount;
        if (sort === "members_asc") return a.memberCount - b.memberCount;
        return b.rating - a.rating;
      });
  }, [activeTab, filterState, people, search, sort, spaces]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const toggleDirection = (direction: string) => {
    const updated = filterState.directions.includes(direction)
      ? filterState.directions.filter((item) => item !== direction)
      : [...filterState.directions, direction];

    handleFilterChange({ ...filterState, directions: updated });
  };

  const handleTagSelect = (tag: string) => {
    setSearch(tag);
    setPage(1);
  };

  const directionItems = mapValuesToFilterItems(categories);
  const tagItems = mapValuesToFilterItems(tags, "#");

  const hasSelectedFilter =
    filterState.directions.length > 0 ||
    filterState.myInterests ||
    search.trim().length > 0;

  const cleanFilters = () => {
    setFilterState((prev) => ({
      ...prev,
      directions: [],
      myInterests: false,
      spaceType: "all",
    }));

    setSearch("");
    setPage(1);
  };

  const filterSections: FilterPanelSection[] = [
    ...(filterState.tab === "PEOPLE"
      ? [
          {
            type: "chips" as const,
            label: "Напрями",
            items: directionItems,
            isSelected: (value: string | number) =>
              filterState.directions.includes(String(value)),
            onClick: (value: string | number) => toggleDirection(String(value)),
            action: {
              label: "Скинути фільтри",
              onClick: cleanFilters,
              visible: hasSelectedFilter,
            },
          },
        ]
      : []),
    ...(filterState.tab === "SPACES"
      ? [
          {
            type: "chips" as const,
            label: "Напрями",
            items: directionItems,
            isSelected: (value: string | number) =>
              filterState.directions.includes(String(value)),
            onClick: (value: string | number) => toggleDirection(String(value)),
          },
        ]
      : []),
    ...(tagItems.length > 0
      ? [
          {
            type: "chips" as const,
            label: "Популярні теги",
            className: "filter-section--separated",
            items: tagItems,
            onClick: (value: string | number) => handleTagSelect(String(value)),
          },
        ]
      : []),
  ];

  return (
    <div className="search-space-page">
      <div className="search-space-container">
        <h1 className="search-space-title">Пошук просторів</h1>

        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === "user" ? "search-tab--active" : ""}`}
            onClick={() => setSearchParams({ type: "user" })}
          >
            Учасники
          </button>
          <button
            className={`search-tab ${activeTab === "community" ? "search-tab--active" : ""}`}
            onClick={() => setSearchParams({ type: "community" })}
          >
            Спільноти
          </button>
          <button
            className={`search-tab ${activeTab === "team" ? "search-tab--active" : ""}`}
            onClick={() => setSearchParams({ type: "team" })}
          >
            Команди
          </button>
        </div>

        <div className="search-bar-row">
          <button
            className={`filter-toggle-btn ${filterOpen ? "filter-toggle-btn--active" : ""}`}
            onClick={() => setFilterOpen((prev) => !prev)}
          >
            ⚙ Фільтр
          </button>

          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Пошук за іменем, тегами..."
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="sort-wrap">
            <button
              className="sort-btn"
              onClick={() => setSortOpen((prev) => !prev)}
            >
              {SORT_OPTIONS.find((option) => option.value === sort)?.label}{" "}
              {sortOpen ? "▴" : "▾"}
            </button>
            {sortOpen && (
              <div className="sort-dropdown">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`sort-option ${sort === option.value ? "sort-option--active" : ""}`}
                    onClick={() => {
                      setSort(option.value);
                      setSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={`search-layout ${filterOpen ? "search-layout--with-sidebar" : ""}`}
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
            {isLoading ? (
              <div className="search-loading">Завантаження...</div>
            ) : filtered.length === 0 ? (
              <div className="search-empty">
                <span style={{ fontSize: 40, opacity: 0.4 }}>🔍</span>
                <p>Нічого не знайдено</p>
                <span>Спробуй змінити запит або фільтри</span>
              </div>
            ) : activeTab === "user" ? (
              (paginated as PersonCardProps[]).map((person) => (
                <PersonCard key={person.id} {...person} />
              ))
            ) : (
              (paginated as SearchSpace[]).map((space) => (
                <SpaceCard
                  key={`${space.type}-${space.id}`}
                  {...space}
                  categories={space.directions}
                  membersCount={space.memberCount}
                  rating={space.rating}
                />
              ))
            )}
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import PersonCard from './components/PersonCard/PersonCard';
import type { PersonCardProps } from './components/PersonCard/PersonCard';
import SpaceCard from './components/SpaceCard/SpaceCard';
import FilterPanel from './components/FilterPanel/FilterPanel';
import Pagination from './components/Pagination/Pagination';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import api from '../../api';
import { communitiesApi } from '../../features/communities/communitiesApi';
import { teamsApi } from '../../features/teams/teamsApi';
import './SearchSpacePage.css';

const ITEMS_PER_PAGE = 6;

const initialFilter: FilterState = {
    tab: 'PEOPLE',
    directions: [],
    myInterests: false,
    spaceType: 'all',
};

const SORT_OPTIONS = [
    { value: 'rating_desc', label: 'За спаданням рейтингу' },
    { value: 'rating_asc', label: 'За зростанням рейтингу' },
    { value: 'members_desc', label: 'За спаданням учасників' },
    { value: 'members_asc', label: 'За зростанням учасників' },
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
    type: 'COMMUNITY' | 'TEAM';
    name: string;
    slug: string;
    avatarUrl: string | null;
    rating: number;
    memberCount: number;
    directions: string[];
    description: string;
}

export default function SearchSpacePage() {
    const [people, setPeople] = useState<PersonCardProps[]>([]);
    const [spaces, setSpaces] = useState<SearchSpace[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>(initialFilter);
    const [sort, setSort] = useState('rating_desc');
    const [sortOpen, setSortOpen] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            api.get<ApiUser[]>('/api/users'),
            api.get<ApiCategory[]>('/api/categories'),
            api.get<ApiTag[]>('/api/tags'),
            communitiesApi.findAll({ limit: 100 }),
            teamsApi.findAll({ limit: 100 })
        ])
            .then(([usersRes, catsRes, tagsRes, commsRes, teamsRes]) => {
                if (!isMounted) return;

                const mappedUsers = usersRes.data.map(p => ({
                    id: String(p.id),
                    firstName: p.firstName || '',
                    lastName: p.lastName || '',
                    nickname: p.nickname || '',
                    avatarUrl: p.avatarUrl || '',
                    rating: p.rating || 0.0,
                    bio: p.bio || '',
                    directions: p.directions || [],
                    interests: p.interests || [],
                }));

                const mappedCommunities = (commsRes.items || []).map(c => ({
                    id: String(c.id),
                    type: 'COMMUNITY' as const,
                    name: c.name,
                    slug: c.slug,
                    avatarUrl: c.avatarUrl,
                    rating: 4.5, // Default rating if none provided
                    memberCount: c.memberCount || 0,
                    directions: c.directions?.map((d: any) => d.name) || [],
                    description: c.description || '',
                }));

                const mappedTeams = (teamsRes.items || []).map(t => ({
                    id: String(t.id),
                    type: 'TEAM' as const,
                    name: t.name,
                    slug: t.slug,
                    avatarUrl: t.avatarUrl,
                    rating: 4.5,
                    memberCount: t.memberCount || 0,
                    directions: t.directions?.map((d: any) => d.name) || [],
                    description: t.description || '',
                }));

                const catNames = catsRes.data.map(c => c.name);
                const tagNames = tagsRes.data.map(t => t.name);

                setPeople(mappedUsers);
                setSpaces([...mappedCommunities, ...mappedTeams]);
                setCategories(catNames);
                setTags(tagNames);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch search page data:', err);
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
        setSearch('');
        setPage(1);
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (filterState.tab === 'PEOPLE') {
            return people.filter(p => {
                const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                if (q && !fullName.includes(q) && !p.bio.toLowerCase().includes(q) && !p.nickname.toLowerCase().includes(q)) return false;
                if (filterState.directions.length > 0) {
                    const match = filterState.directions.some(d => p.directions.includes(d));
                    if (!match) return false;
                }
                return true;
            }).sort((a, b) => {
                if (sort === 'rating_asc') return a.rating - b.rating;
                return b.rating - a.rating;
            });
        } else {
            return spaces.filter(s => {
                if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
                if (filterState.directions.length > 0) {
                    const match = filterState.directions.some(d => s.directions.includes(d));
                    if (!match) return false;
                }
                if (filterState.spaceType !== 'all' && s.type !== filterState.spaceType) return false;
                return true;
            }).sort((a, b) => {
                if (sort === 'rating_asc') return a.rating - b.rating;
                if (sort === 'members_desc') return b.memberCount - a.memberCount;
                if (sort === 'members_asc') return a.memberCount - b.memberCount;
                return b.rating - a.rating;
            });
        }
    }, [people, spaces, search, filterState, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, page]);

    return (
        <div className="search-space-page">
            <div className="search-space-container">
                <h1 className="search-space-title">Пошук</h1>

                <div className="search-bar-row">
                    <button
                        className={`filter-toggle-btn ${filterOpen ? 'filter-toggle-btn--active' : ''}`}
                        onClick={() => setFilterOpen(prev => !prev)}
                    >
                        ⚙ Фільтр
                    </button>

                    <div className="search-input-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Пошук за іменем, тегами..."
                        />
                        {search && (
                            <button className="search-clear" onClick={() => setSearch('')}>×</button>
                        )}
                    </div>

                    <div className="sort-wrap">
                        <button className="sort-btn" onClick={() => setSortOpen(prev => !prev)}>
                            {SORT_OPTIONS.find(o => o.value === sort)?.label} {sortOpen ? '▲' : '▼'}
                        </button>
                        {sortOpen && (
                            <div className="sort-dropdown">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`sort-option ${sort === opt.value ? 'sort-option--active' : ''}`}
                                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`search-layout ${filterOpen ? 'search-layout--with-sidebar' : ''}`}>
                    {filterOpen && (
                        <aside className="search-sidebar">
                            <FilterPanel
                                filterState={filterState}
                                onChange={handleFilterChange}
                                onReset={handleReset}
                                directions={categories}
                                tags={tags}
                                onTagSelect={(tag) => { setSearch(tag); setPage(1); }}
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
                        ) : filterState.tab === 'PEOPLE' ? (
                            (paginated as PersonCardProps[]).map(p => (
                                <PersonCard key={p.id} {...p} />
                            ))
                        ) : (
                            (paginated as SearchSpace[]).map(s => (
                                <SpaceCard
                                    key={`${s.type}-${s.id}`}
                                    {...s}
                                    categories={s.directions}
                                    membersCount={s.memberCount}
                                    rating={s.rating}
                                />
                            ))
                        )}
                    </div>
                </div>

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}

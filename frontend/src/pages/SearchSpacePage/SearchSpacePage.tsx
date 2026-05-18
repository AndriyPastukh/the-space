import { useState, useMemo, useEffect } from 'react';
import PersonCard from './components/PersonCard/PersonCard';
import type { PersonCardProps } from './components/PersonCard/PersonCard';
import SpaceCard from './components/SpaceCard/SpaceCard';
import FilterPanel from './components/FilterPanel/FilterPanel';
import Pagination from './components/Pagination/Pagination';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import api from '../../api';
import './SearchSpacePage.css';

const MOCK_SPACES = [
    {
        id: '4', type: 'COMMUNITY' as const, name: 'Дизайнери UA', slug: 'designers-ua',
        avatarUrl: '', rating: 4.8, membersCount: 1240,
        categories: ['ui/ux design', 'web', 'mobile', 'gamedev'],
        description: 'Спільнота українських дизайнерів. Обмін досвідом, фідбек, колаборації.',
    },
    {
        id: '5', type: 'TEAM' as const, name: 'React Builders', slug: 'react-builders',
        avatarUrl: '', rating: 4.6, membersCount: 12,
        categories: ['web', 'mobile'],
        description: 'Команда розробників що будує SaaS продукти на React і Next.js.',
    },
    {
        id: '6', type: 'COMMUNITY' as const, name: 'GameDev UA', slug: 'gamedev-ua',
        avatarUrl: '', rating: 4.9, membersCount: 580,
        categories: ['gamedev', 'ui/ux design'],
        description: 'Розробники ігор в Україні. Unity, Unreal, Godot.',
    },
];

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

export default function SearchSpacePage() {
    const [people, setPeople] = useState<PersonCardProps[]>([]);
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
            api.get<ApiTag[]>('/api/tags')
        ])
            .then(([usersRes, catsRes, tagsRes]) => {
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
                
                const catNames = catsRes.data.map(c => c.name);
                const tagNames = tagsRes.data.map(t => t.name);

                setPeople(mappedUsers);
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
        console.log('Filter state:', newState);
    };

    const handleReset = () => {
        setFilterState(initialFilter);
        setSearch('');
        setPage(1);
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        if (filterState.tab === 'PEOPLE') {
            return people.filter(p => {
                const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                if (q && !fullName.includes(q) && !p.bio.toLowerCase().includes(q)) return false;
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
            return MOCK_SPACES.filter(s => {
                if (q && !s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false;
                if (filterState.directions.length > 0) {
                    const match = filterState.directions.some(d => s.categories.includes(d));
                    if (!match) return false;
                }
                if (filterState.spaceType !== 'all' && s.type !== filterState.spaceType) return false;
                return true;
            }).sort((a, b) => {
                if (sort === 'rating_asc') return a.rating - b.rating;
                if (sort === 'members_desc') return b.membersCount - a.membersCount;
                if (sort === 'members_asc') return a.membersCount - b.membersCount;
                return b.rating - a.rating;
            });
        }
    }, [people, search, filterState, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <div className="search-space-page">
            <div className="search-space-container">
                <h1 className="search-space-title">Пошук</h1>

                {/* Search bar row */}
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

                {/* Layout */}
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
                        {isLoading && filterState.tab === 'PEOPLE' ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                Завантаження користувачів...
                            </div>
                        ) : paginated.length === 0 ? (
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
                            (paginated as typeof MOCK_SPACES).map(s => (
                                <SpaceCard key={s.id} {...s} />
                            ))
                        )}
                    </div>
                </div>

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}
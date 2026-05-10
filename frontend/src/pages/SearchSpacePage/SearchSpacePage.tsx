import { useState, useMemo, useEffect } from 'react';
import PersonCard from './components/PersonCard/PersonCard';
import SpaceCard from './components/SpaceCard/SpaceCard';
import FilterPanel from './components/FilterPanel/FilterPanel';
import Pagination from './components/Pagination/Pagination';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import { communitiesApi } from '../../features/communities/communitiesApi';
import { teamsApi } from '../../features/teams/teamsApi';
import './SearchSpacePage.css';

const MOCK_PEOPLE = [
    {
        id: '1', firstName: 'Іван', lastName: 'Петренко', nickname: 'ivan_p',
        avatarUrl: '', rating: 4.9,
        bio: 'Full-stack розробник, люблю React і Node.js. Шукаю цікаві проєкти.',
        directions: ['web', 'backend', 'mobile'],
        interests: ['gamedev', 'ui/ux design', 'Data Science'],
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

export default function SearchSpacePage() {
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>(initialFilter);
    const [sort, setSort] = useState('rating_desc');
    const [sortOpen, setSortOpen] = useState(false);
    const [page, setPage] = useState(1);

    const [spaces, setSpaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalSpaces, setTotalSpaces] = useState(0);

    const handleFilterChange = (newState: FilterState) => {
        setFilterState(newState);
        setPage(Page);
        setPage(1);
    };

    const handleReset = () => {
        setFilterState(initialFilter);
        setSearch('');
        setPage(1);
    };

    useEffect(() => {
        if (filterState.tab === 'SPACES') {
            const fetchSpaces = async () => {
                setLoading(true);
                try {
                    const params = {
                        page,
                        limit: ITEMS_PER_PAGE,
                        search,
                    };

                    let items: any[] = [];
                    let total = 0;

                    if (filterState.spaceType === 'all' || filterState.spaceType === 'community') {
                        const comms = await communitiesApi.findAll(params);
                        items = [...items, ...comms.items.map(i => ({ ...i, type: 'COMMUNITY' }))];
                        total += comms.meta.total;
                    }

                    if (filterState.spaceType === 'all' || filterState.spaceType === 'team') {
                        const teams = await teamsApi.findAll(params);
                        items = [...items, ...teams.items.map(i => ({ ...i, type: 'TEAM' }))];
                        total += teams.meta.total;
                    }

                    items.sort((a, b) => {
                        if (sort === 'members_desc') return (b.memberCount || 0) - (a.memberCount || 0);
                        if (sort === 'members_asc') return (a.memberCount || 0) - (b.memberCount || 0);
                        return (b.rating || 0) - (a.rating || 0);
                    });

                    setSpaces(items.slice(0, ITEMS_PER_PAGE));
                    setTotalSpaces(total);
                } catch (err) {
                    console.error('Failed to fetch spaces:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSpaces();
        }
    }, [search, filterState, sort, page]);

    const filteredPeople = useMemo(() => {
        if (filterState.tab !== 'PEOPLE') return [];
        const q = search.toLowerCase();
        return MOCK_PEOPLE.filter(p => {
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
    }, [search, filterState, sort]);

    const totalPages = filterState.tab === 'PEOPLE' 
        ? Math.max(1, Math.ceil(filteredPeople.length / ITEMS_PER_PAGE))
        : Math.max(1, Math.ceil(totalSpaces / ITEMS_PER_PAGE));

    const paginatedPeople = filteredPeople.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
                            />
                        </aside>
                    )}

                    <div className="search-results">
                        {loading ? (
                            <div className="search-loading">Завантаження...</div>
                        ) : (filterState.tab === 'PEOPLE' ? paginatedPeople : spaces).length === 0 ? (
                            <div className="search-empty">
                                <span style={{ fontSize: 40, opacity: 0.4 }}>🔍</span>
                                <p>Нічого не знайдено</p>
                                <span>Спробуй змінити запит або фільтри</span>
                            </div>
                        ) : filterState.tab === 'PEOPLE' ? (
                            paginatedPeople.map(p => (
                                <PersonCard key={p.id} {...p} />
                            ))
                        ) : (
                            spaces.map(s => (
                                <SpaceCard 
                                    key={`${s.type}-${s.id}`} 
                                    {...s} 
                                    categories={s.directions?.map((d: any) => d.name) || []}
                                    membersCount={s.memberCount}
                                    rating={s.rating || 0}
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

import { useState, useMemo } from 'react';
import PersonCard from './components/PersonCard/PersonCard';
import SpaceCard from './components/SpaceCard/SpaceCard';
import FilterPanel from './components/FilterPanel/FilterPanel';
import Pagination from './components/Pagination/Pagination';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import './SearchSpacePage.css';

const MOCK_PEOPLE = [
    {
        id: '1', firstName: 'Іван', lastName: 'Петренко', nickname: 'ivan_p',
        avatarUrl: '', rating: 4.9,
        bio: 'Full-stack розробник, люблю React і Node.js. Шукаю цікаві проєкти.',
        directions: ['web', 'backend', 'mobile'],
        interests: ['gamedev', 'ui/ux design', 'Data Science'],
    },
    {
        id: '2', firstName: 'Марія', lastName: 'Коваль', nickname: 'maria_k',
        avatarUrl: '', rating: 4.7,
        bio: 'UI/UX дизайнер з 3 роками досвіду. Працюю з Figma і Sketch.',
        directions: ['ui/ux design', 'web'],
        interests: ['mobile', 'gamedev'],
    },
    {
        id: '3', firstName: 'Олег', lastName: 'Сидоренко', nickname: 'oleg_s',
        avatarUrl: '', rating: 5.0,
        bio: 'Data Scientist, ML ентузіаст. Python, TensorFlow, sklearn.',
        directions: ['Data Science', 'backend'],
        interests: ['web', 'QA/testing'],
    },
];

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

export default function SearchSpacePage() {
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>(initialFilter);
    const [sort, setSort] = useState('rating_desc');
    const [sortOpen, setSortOpen] = useState(false);
    const [page, setPage] = useState(1);

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
    }, [search, filterState, sort]);

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
                            />
                        </aside>
                    )}

                    <div className="search-results">
                        {paginated.length === 0 ? (
                            <div className="search-empty">
                                <span style={{ fontSize: 40, opacity: 0.4 }}>🔍</span>
                                <p>Нічого не знайдено</p>
                                <span>Спробуй змінити запит або фільтри</span>
                            </div>
                        ) : filterState.tab === 'PEOPLE' ? (
                            (paginated as typeof MOCK_PEOPLE).map(p => (
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
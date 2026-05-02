import { useState, useMemo } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import FilterPanel from './components/FilterPanel/FilterPanel';
import TaskCard from './components/TaskCard/TaskCard';
import KnowledgeCard from './components/KnowledgeCard/KnowledgeCard';
import type { FilterState } from './components/FilterPanel/FilterPanel';
import './SearchPage.css';

const MOCK_DATA = [
    {
        id: '12',
        type: 'TASK',
        title: 'Розробка мобільного додатку для доставки',
        description: "Потрібно розробити кросплатформний додаток на React Native. Основний функціонал: відстеження кур'єра, інтеграція з картою...",
        status: 'OPEN',
        categories: [{ id: 1, name: 'Mobile Development' }, { id: 5, name: 'Design' }],
        deadline: '2026-05-20T18:00:00Z',
        createdAt: '2026-04-26T11:50:00Z',
        author: { id: 'user-uuid', name: 'ТОВ "ТехноСвіт"', avatarUrl: 'https://cdn.link/avatar.jpg', rating: 4.9, reviewsCount: 24 },
        statistics: { viewsCount: 142, proposalsCount: 12 },
        viewer: { isSaved: true, myProposalId: null },
    },
    {
        id: '13',
        type: 'TASK',
        title: 'Створення лендінгу для SaaS продукту',
        description: 'Потрібен лендінг для нашого SaaS рішення. Адаптивний дизайн, анімації, інтеграція з CRM...',
        status: 'OPEN',
        categories: [{ id: 2, name: 'Web Development' }, { id: 5, name: 'Design' }],
        deadline: '2026-06-01T18:00:00Z',
        createdAt: '2026-04-25T09:00:00Z',
        author: { id: 'user-2', name: 'Марія К.', avatarUrl: '', rating: 4.7, reviewsCount: 15 },
        statistics: { viewsCount: 98, proposalsCount: 7 },
        viewer: { isSaved: false, myProposalId: null },
    },
    {
        id: '15',
        type: 'KNOWLEDGE',
        status: 'OPEN',
        offer: {
            categories: [{ id: 1, name: 'python' }, { id: 2, name: 'api' }],
            description: 'Основи створення API на Python, базові CRUD операції.',
        },
        want: {
            categories: [{ id: 5, name: 'design' }, { id: 6, name: 'figma' }],
            description: 'Дизайн у Figma, підбір кольорів і створення базових компонентів.',
        },
        deadline: '2026-05-07T18:00:00Z',
        createdAt: '2026-04-26T07:27:00Z',
        author: { id: 'user-uuid', name: 'Іван І. М.', avatarUrl: '', rating: 5.0, reviewsCount: 10 },
        statistics: { viewsCount: 15, proposalsCount: 5 },
        viewer: { isSaved: false, myProposalId: 'prop-45' },
    },
    {
        id: '16',
        type: 'KNOWLEDGE',
        status: 'OPEN',
        offer: {
            categories: [{ id: 3, name: 'react' }, { id: 4, name: 'node.js' }],
            description: 'Full-stack розробка на React + Node.js. REST API, хуки, стейт менеджмент.',
        },
        want: {
            categories: [{ id: 7, name: 'ml/ai' }],
            description: 'Основи машинного навчання, базові алгоритми, sklearn.',
        },
        deadline: '2026-05-15T18:00:00Z',
        createdAt: '2026-04-24T14:00:00Z',
        author: { id: 'user-3', name: 'Олег Д.', avatarUrl: '', rating: 4.8, reviewsCount: 32 },
        statistics: { viewsCount: 44, proposalsCount: 3 },
        viewer: { isSaved: true, myProposalId: null },
    },
];

const initialFilter: FilterState = {
    tab: 'TASK',
    categories: [],
    sortBy: 'createdAt',
};

export default function SearchPage() {
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>(initialFilter);
    const [savedIds, setSavedIds] = useState<string[]>(
        MOCK_DATA.filter(d => d.viewer.isSaved).map(d => d.id)
    );

    const handleFilterChange = (newState: FilterState) => {
        setFilterState(newState);
        console.log('Filter state updated:', newState);
    };

    const handleSave = (id: string) => {
        setSavedIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const filtered = useMemo(() => {
        return MOCK_DATA.filter(item => {
            if (item.type !== filterState.tab) return false;

            if (search.trim()) {
                const q = search.toLowerCase();
                const inTitle = 'title' in item && item.title?.toLowerCase().includes(q);
                const inDesc = 'description' in item && item.description?.toLowerCase().includes(q);
                const inOffer = 'offer' in item && (item as any).offer?.description?.toLowerCase().includes(q);
                const inWant = 'want' in item && (item as any).want?.description?.toLowerCase().includes(q);
                if (!inTitle && !inDesc && !inOffer && !inWant) return false;
            }

            if (filterState.categories.length > 0) {
                const itemCats: string[] = 'categories' in item
                    ? (item.categories ?? []).map((c: any) => c.name.toLowerCase())
                    : [
                        ...((item as any).offer?.categories?.map((c: any) => c.name.toLowerCase()) ?? []),
                        ...((item as any).want?.categories?.map((c: any) => c.name.toLowerCase()) ?? []),
                    ];
                const hasMatch = filterState.categories.some(fc =>
                    itemCats.includes(fc.toLowerCase())
                );
                if (!hasMatch) return false;
            }

            return true;
        }).sort((a, b) => {
            if (filterState.sortBy === 'proposals') {
                return b.statistics.proposalsCount - a.statistics.proposalsCount;
            }
            if (filterState.sortBy === 'rating') {
                return b.author.rating - a.author.rating;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [search, filterState]);

    return (
        <div className="search-page">
            <div className="search-page-container">

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onFilterToggle={() => setFilterOpen(prev => !prev)}
                    filterOpen={filterOpen}
                    sortBy={filterState.sortBy}
                    onSortChange={val => handleFilterChange({ ...filterState, sortBy: val })}
                />

                <div className={`search-layout ${filterOpen ? 'search-layout--open' : ''}`}>
                    {filterOpen && (
                        <aside className="search-sidebar">
                            <FilterPanel
                                filterState={filterState}
                                onChange={handleFilterChange}
                            />
                        </aside>
                    )}

                    <div className="search-results">
                        {filtered.length === 0 ? (
                            <div className="search-empty">
                                <span className="search-empty-icon">🔍</span>
                                <p>Нічого не знайдено</p>
                                <span>Спробуй змінити запит або фільтри</span>
                            </div>
                        ) : (
                            filtered.map(item => {
                                if (item.type === 'TASK') {
                                    const t = item as any;
                                    return (
                                        <TaskCard
                                            key={t.id}
                                            {...t}
                                        />
                                    );
                                }
                                const k = item as any;
                                return (
                                    <KnowledgeCard
                                        key={k.id}
                                        {...k}
                                        viewer={{ ...k.viewer, isSaved: savedIds.includes(k.id) }}
                                        onSave={handleSave}
                                    />
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
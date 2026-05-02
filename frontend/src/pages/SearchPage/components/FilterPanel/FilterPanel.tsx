import './FilterPanel.css';

type TabType = 'TASK' | 'KNOWLEDGE';

interface FilterState {
    tab: TabType;
    categories: string[];
    sortBy: string;
}

interface FilterPanelProps {
    filterState: FilterState;
    onChange: (state: FilterState) => void;
}

const TASK_CATEGORIES = ['Mobile Development', 'Web Development', 'Design', 'Backend', 'DevOps', 'ML/AI', 'Gamedev'];
const KNOWLEDGE_CATEGORIES = ['python', 'api', 'design', 'figma', 'react', 'node.js', 'ml/ai'];

export default function FilterPanel({ filterState, onChange }: FilterPanelProps) {
    const categories = filterState.tab === 'TASK' ? TASK_CATEGORIES : KNOWLEDGE_CATEGORIES;

    const toggleCategory = (cat: string) => {
        const updated = filterState.categories.includes(cat)
            ? filterState.categories.filter(c => c !== cat)
            : [...filterState.categories, cat];
        onChange({ ...filterState, categories: updated });
    };

    const setTab = (tab: TabType) => {
        onChange({ ...filterState, tab, categories: [] });
    };

    return (
        <div className="filter-panel">
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterState.tab === 'TASK' ? 'filter-tab--active' : ''}`}
                    onClick={() => setTab('TASK')}
                >
                    Task
                </button>
                <button
                    className={`filter-tab ${filterState.tab === 'KNOWLEDGE' ? 'filter-tab--active' : ''}`}
                    onClick={() => setTab('KNOWLEDGE')}
                >
                    Knowledge
                </button>
            </div>

            <div className="filter-section">
                <span className="filter-section-label">Категорії</span>
                <div className="filter-chips">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${filterState.categories.includes(cat) ? 'filter-chip--active' : ''}`}
                            onClick={() => toggleCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filterState.categories.length > 0 && (
                <button
                    className="filter-clear"
                    onClick={() => onChange({ ...filterState, categories: [] })}
                >
                    Скинути фільтри
                </button>
            )}
        </div>
    );
}

export type { FilterState, TabType };
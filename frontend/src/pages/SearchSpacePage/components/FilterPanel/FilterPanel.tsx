import './FilterPanel.css';

type FilterTab = 'PEOPLE' | 'SPACES';

interface FilterState {
    tab: FilterTab;
    directions: string[];
    myInterests: boolean;
    spaceType: 'all' | 'COMMUNITY' | 'TEAM';
}

interface FilterPanelProps {
    filterState: FilterState;
    onChange: (state: FilterState) => void;
    onReset: () => void;
    directions: string[];
    tags: string[];
    onTagSelect: (tag: string) => void;
}

export default function FilterPanel({
    filterState,
    onChange,
    onReset,
    directions = [],
    tags = [],
    onTagSelect,
}: FilterPanelProps) {
    const toggleDirection = (dir: string) => {
        const updated = filterState.directions.includes(dir)
            ? filterState.directions.filter(d => d !== dir)
            : [...filterState.directions, dir];
        onChange({ ...filterState, directions: updated });
    };

    // setTab removed; tab control moved to page level

    return (
        <div className="filter-panel">
            <div className="filter-panel__header">
                <span className="filter-panel__title">Фільтри</span>
                <button className="filter-panel__reset" onClick={onReset}>Скинути</button>
            </div>

            {/* Tabs moved to page-level */}

            {filterState.tab === 'PEOPLE' && (
                <>
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={filterState.myInterests}
                            onChange={e => onChange({ ...filterState, myInterests: e.target.checked })}
                        />
                        Мої інтереси
                    </label>

                    <div className="filter-section">
                        <span className="filter-section__label">Напрями</span>
                        <div className="filter-chips">
                            {directions.map(dir => (
                                <button
                                    key={dir}
                                    className={`filter-chip ${filterState.directions.includes(dir) ? 'filter-chip--active' : ''}`}
                                    onClick={() => toggleDirection(dir)}
                                >
                                    {dir}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Spaces filters */}
            {filterState.tab === 'SPACES' && (
                <>
                    <div className="filter-section">
                        <span className="filter-section__label">Напрями</span>
                        <div className="filter-chips">
                            {directions.map(dir => (
                                <button
                                    key={dir}
                                    className={`filter-chip ${filterState.directions.includes(dir) ? 'filter-chip--active' : ''}`}
                                    onClick={() => toggleDirection(dir)}
                                >
                                    {dir}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {tags.length > 0 && (
                <div className="filter-section" style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <span className="filter-section__label">Популярні теги</span>
                    <div className="filter-chips">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                className="filter-chip"
                                onClick={() => onTagSelect(tag)}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export type { FilterState, FilterTab };
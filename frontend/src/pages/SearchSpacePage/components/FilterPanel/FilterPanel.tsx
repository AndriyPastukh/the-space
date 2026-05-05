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
}

const DIRECTIONS = ['web', 'mobile', 'gamedev', 'ui/ux design', 'QA/testing', 'Data Science'];

export default function FilterPanel({ filterState, onChange, onReset }: FilterPanelProps) {
    const toggleDirection = (dir: string) => {
        const updated = filterState.directions.includes(dir)
            ? filterState.directions.filter(d => d !== dir)
            : [...filterState.directions, dir];
        onChange({ ...filterState, directions: updated });
    };

    const setTab = (tab: FilterTab) => {
        onChange({ ...filterState, tab, directions: [], myInterests: false, spaceType: 'all' });
    };

    return (
        <div className="filter-panel">
            <div className="filter-panel__header">
                <span className="filter-panel__title">Фільтри</span>
                <button className="filter-panel__reset" onClick={onReset}>Скинути</button>
            </div>

            {/* Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterState.tab === 'PEOPLE' ? 'filter-tab--active' : ''}`}
                    onClick={() => setTab('PEOPLE')}
                >
                    Учасники
                </button>
                <button
                    className={`filter-tab ${filterState.tab === 'SPACES' ? 'filter-tab--active' : ''}`}
                    onClick={() => setTab('SPACES')}
                >
                    Простори
                </button>
            </div>

            {/* People filters */}
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
                            {DIRECTIONS.map(dir => (
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
                            {DIRECTIONS.map(dir => (
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

                    <div className="filter-section">
                        <span className="filter-section__label">Тип простору</span>
                        <div className="filter-chips">
                            {(['all', 'COMMUNITY', 'TEAM'] as const).map(t => (
                                <button
                                    key={t}
                                    className={`filter-chip ${filterState.spaceType === t ? 'filter-chip--active' : ''}`}
                                    onClick={() => onChange({ ...filterState, spaceType: t })}
                                >
                                    {t === 'all' ? 'Всі' : t === 'COMMUNITY' ? 'Спільнота' : 'Команда'}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export type { FilterState, FilterTab };
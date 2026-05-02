import './SearchBar.css';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onFilterToggle: () => void;
    filterOpen: boolean;
    sortBy: string;
    onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Датою' },
    { value: 'rating', label: 'Рейтингом' },
    { value: 'proposals', label: 'Пропозиціями' },
];

export default function SearchBar({
    value,
    onChange,
    onFilterToggle,
    filterOpen,
    sortBy,
    onSortChange,
}: SearchBarProps) {
    return (
        <div className="search-bar-row">
            <button
                className={`filter-toggle-btn ${filterOpen ? 'filter-toggle-btn--active' : ''}`}
                onClick={onFilterToggle}
                title="Фільтри"
            >
                <span className="filter-icon">⚙</span>
                <span className="filter-label">Фільтр</span>
            </button>

            <div className="search-input-wrap">
                <span className="search-icon">🔍</span>
                <input
                    className="search-input"
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Пошук за назвою або описом..."
                />
                {value && (
                    <button className="search-clear" onClick={() => onChange('')}>×</button>
                )}
            </div>

            <select
                className="sort-select"
                value={sortBy}
                onChange={e => onSortChange(e.target.value)}
            >
                {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
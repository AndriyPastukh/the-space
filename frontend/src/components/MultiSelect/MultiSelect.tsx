import "./MultiSelect.css";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  error?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  error,
}: MultiSelectProps) {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option],
    );
  };

  return (
    <div className="multiselect-wrap">
      <div className={`multiselect-chips ${error ? "multiselect-error" : ""}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip ${selected.includes(option) ? "chip--active" : ""}`}
            onClick={() => toggle(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

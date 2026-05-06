import "./MultiSelect.css";

// Дозволяємо передавати як масив рядків, так і масив будь-яких об'єктів
interface MultiSelectProps {
  options: any[];
  selected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  valueKey?: string; // ключ для ID (за замовчуванням шукатиме id або value)
  labelKey?: string; // ключ для назви (за замовчуванням шукатиме name або label)
  error?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  valueKey,
  labelKey,
  error,
}: MultiSelectProps) {
  
  // Універсальна нормалізація опцій
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    // Беремо значення по вказаному ключу, або шукаємо стандартні
    return {
      value: valueKey ? opt[valueKey] : (opt.id ?? opt.value),
      label: labelKey ? opt[labelKey] : (opt.name ?? opt.label),
    };
  });

  const toggle = (value: string | number) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="multiselect-wrap">
      <div className={`multiselect-chips ${error ? "multiselect-error" : ""}`}>
        {normalizedOptions.map((option) => {
          const isActive = selected.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={`chip ${isActive ? "chip--active" : ""}`}
              onClick={() => toggle(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
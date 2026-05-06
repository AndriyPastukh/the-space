import "./MultiSelect.css";

type MultiSelectValue = string | number;

type PrimitiveOption<TValue extends MultiSelectValue> = TValue;

type ObjectOption<TValue extends MultiSelectValue> = {
  [key: string]: unknown;
} & {
  id?: TValue;
  value?: TValue;
  name?: string;
  label?: string;
};

type MultiSelectOption<TValue extends MultiSelectValue> =
  | PrimitiveOption<TValue>
  | ObjectOption<TValue>;

interface MultiSelectProps<TValue extends MultiSelectValue> {
  options: MultiSelectOption<TValue>[];
  selected: TValue[];
  onChange: (selected: TValue[]) => void;
  valueKey?: string;
  labelKey?: string;
  error?: string;
}

export default function MultiSelect<TValue extends MultiSelectValue>({
  options,
  selected,
  onChange,
  valueKey,
  labelKey,
  error,
}: MultiSelectProps<TValue>) {
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return {
        value: opt,
        label: String(opt),
      };
    }

    const rawValue = valueKey ? opt[valueKey] : (opt.id ?? opt.value);
    const rawLabel = labelKey ? opt[labelKey] : (opt.name ?? opt.label);

    return {
      value: rawValue as TValue,
      label: String(rawLabel ?? rawValue ?? ""),
    };
  });

  const toggle = (value: TValue) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="multiselect-wrap">
      <div className={`multiselect-chips ${error ? "multiselect-error" : ""}`}>
        {normalizedOptions.map((option) => {
          const isActive = selected.includes(option.value);

          return (
            <button
              key={String(option.value)}
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

import { useState, useMemo } from "react";
import "./MultiSelect.css";

type MultiSelectValue = string | number;

type ObjectOption<TValue extends MultiSelectValue> = {
  id: TValue;
  name: string;
};

interface MultiSelectProps<TValue extends MultiSelectValue> {
  options: ObjectOption<TValue>[];
  selected: TValue[];
  onChange: (selected: TValue[]) => void;
  onCreateOption?: (name: string) => Promise<ObjectOption<TValue>>;
  error?: string;
  placeholder?: string;
}

export default function MultiSelect<TValue extends MultiSelectValue>({
  options,
  selected,
  onChange,
  onCreateOption,
  error,
  placeholder = "Додати...",
}: MultiSelectProps<TValue>) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Map of all known options (base + any created in this session)
  const [localOptions, setLocalOptions] = useState<ObjectOption<TValue>[]>([]);

  const allOptions = useMemo(() => {
    const combined = [...options, ...localOptions];
    // De-duplicate by ID
    const seen = new Set();
    return combined.filter(o => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
    });
  }, [options, localOptions]);

  const selectedOptions = allOptions.filter(o => selected.includes(o.id));
  const unselectedOptions = allOptions.filter(o => !selected.includes(o.id));

  const filteredUnselected = unselectedOptions.filter(o => 
    o.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const toggle = (id: TValue) => {
    const next = selected.includes(id)
      ? selected.filter((v) => v !== id)
      : [...selected, id];
    onChange(next);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        
        // Check if it already exists in allOptions
        const existing = allOptions.find(o => o.name.toLowerCase() === inputValue.trim().toLowerCase());
        if (existing) {
            if (!selected.includes(existing.id)) {
                toggle(existing.id);
            }
            setInputValue("");
            return;
        }

        if (onCreateOption) {
            try {
                const newOpt = await onCreateOption(inputValue.trim());
                setLocalOptions(prev => [...prev, newOpt]);
                onChange([...selected, newOpt.id]);
                setInputValue("");
            } catch (err) {
                console.error("Failed to create option:", err);
            }
        }
    } else if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
        // Remove last selected
        onChange(selected.slice(0, -1));
    }
  };

  return (
    <div className={`multiselect-container ${isFocused ? 'is-focused' : ''} ${error ? 'has-error' : ''}`}>
      <div className="multiselect-field" onClick={() => document.getElementById('ms-input')?.focus()}>
        {selectedOptions.map(opt => (
          <span key={String(opt.id)} className="chip chip--active">
            {opt.name}
            <button type="button" className="chip-remove" onClick={(e) => { e.stopPropagation(); toggle(opt.id); }}>×</button>
          </span>
        ))}
        
        <input
          id="ms-input"
          type="text"
          className="multiselect-input-v2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={selected.length === 0 ? placeholder : ""}
          autoComplete="off"
        />
      </div>

      {isFocused && (inputValue || filteredUnselected.length > 0) && (
        <div className="multiselect-dropdown">
          {filteredUnselected.map(opt => (
            <div 
                key={String(opt.id)} 
                className="dropdown-item"
                onClick={() => { toggle(opt.id); setInputValue(""); }}
            >
              {opt.name}
            </div>
          ))}
          {inputValue && !allOptions.some(o => o.name.toLowerCase() === inputValue.toLowerCase()) && onCreateOption && (
            <div 
                className="dropdown-item dropdown-item--create"
                onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any)}
            >
              Створити "{inputValue}"
            </div>
          )}
        </div>
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

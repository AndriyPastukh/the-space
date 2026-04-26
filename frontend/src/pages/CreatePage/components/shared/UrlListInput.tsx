import { useState } from 'react';
import './UrlListInput.css';

interface UrlListInputProps {
    urls: string[];
    onChange: (urls: string[]) => void;
    error?: string;
}

export default function UrlListInput({ urls, onChange, error }: UrlListInputProps) {
    const [input, setInput] = useState('');
    const [inputError, setInputError] = useState('');

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleAdd = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        if (!isValidUrl(trimmed)) {
            setInputError('Невалідне посилання');
            return;
        }
        onChange([...urls, trimmed]);
        setInput('');
        setInputError('');
    };

    const handleRemove = (index: number) => {
        onChange(urls.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="url-list">
            <div className="url-input-row">
                <input
                    className={`form-input ${inputError ? 'form-input--error' : ''}`}
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value); setInputError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com"
                />
                <button type="button" className="url-add-btn" onClick={handleAdd}>+</button>
            </div>
            {inputError && <span className="field-error">{inputError}</span>}
            {error && <span className="field-error">{error}</span>}
            {urls.length > 0 && (
                <ul className="url-list-items">
                    {urls.map((url, i) => (
                        <li key={i} className="url-item">
                            <a href={url} target="_blank" rel="noreferrer">{url}</a>
                            <button type="button" className="url-remove-btn" onClick={() => handleRemove(i)}>×</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
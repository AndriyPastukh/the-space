import { useRef, useState, useCallback } from 'react';
import './AvatarUpload.css';

interface AvatarUploadProps {
    file: File | null;
    onChange: (file: File | null) => void;
    error?: string;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_EXT = ['.png', '.jpeg', '.jpg'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function AvatarUpload({ file, onChange, error }: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadError, setUploadError] = useState<string>('');

    const validateAndSet = (f: File) => {
        setUploadError('');
        if (!ALLOWED_TYPES.includes(f.type)) {
            setUploadError(`Непідтримуваний формат. Дозволені: ${ALLOWED_EXT.join(', ')}`);
            return;
        }
        if (f.size > MAX_SIZE_BYTES) {
            setUploadError(`Файл завеликий. Максимум ${MAX_SIZE_MB} МБ`);
            return;
        }
        onChange(f);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) validateAndSet(f);
        e.target.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) validateAndSet(f);
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleRemove = () => {
        onChange(null);
        setUploadError('');
    };

    const preview = file ? URL.createObjectURL(file) : null;
    const displayError = error || uploadError;

    return (
        <div className="avatar-upload">
            {file && preview ? (
                <div className="avatar-upload__preview">
                    <img src={preview} alt="Avatar preview" className="avatar-upload__img" />
                    <div className="avatar-upload__preview-info">
                        <span className="avatar-upload__filename">{file.name}</span>
                        <span className="avatar-upload__filesize">
                            {(file.size / (1024 * 1024)).toFixed(2)} МБ
                        </span>
                        <button
                            type="button"
                            className="avatar-upload__remove"
                            onClick={handleRemove}
                            aria-label="Видалити файл"
                        >
                            ✕ Видалити
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`avatar-upload__zone ${dragOver ? 'avatar-upload__zone--dragover' : ''} ${displayError ? 'avatar-upload__zone--error' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
                >
                    <div className="avatar-upload__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="avatar-upload__hint">
                        <span className="avatar-upload__cta">Натисніть або перетягніть файл</span>
                    </p>
                    <p className="avatar-upload__meta">PNG, JPEG, JPG · до {MAX_SIZE_MB} МБ</p>
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept=".png,.jpeg,.jpg,image/png,image/jpeg"
                className="avatar-upload__input"
                onChange={handleFileChange}
            />
            {displayError && <span className="field-error">{displayError}</span>}
        </div>
    );
}
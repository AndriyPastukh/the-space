import { useState } from 'react';
import MultiSelect from '../../../../components/MultiSelect/MultiSelect';
import AvatarUpload from '../shared/AvatarUpload/AvatarUpload';
import './CommunityForm.css';

const DIRECTIONS = ['web', 'mobile', 'gamedev', 'design', 'ml/ai', 'backend', 'devops', 'other'];
const MAX_WORDS = 300;

const countWords = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export interface CommunityFormState {
    name: string;
    directions: string[];
    description: string;
    avatar: File | null;
}

interface CommunityFormProps {
    formState: CommunityFormState;
    onChange: (state: CommunityFormState) => void;
}

type FormErrors = Partial<Record<keyof CommunityFormState, string>>;

export default function CommunityForm({ formState, onChange }: CommunityFormProps) {
    const [errors, setErrors] = useState<FormErrors>({});
    const [avatarError, setAvatarError] = useState('');

    const update = <K extends keyof CommunityFormState>(field: K, value: CommunityFormState[K]) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
        if (field === 'avatar') setAvatarError('');
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formState.name.trim()) {
            newErrors.name = 'Назва спільноти обовʼязкова';
        }

        if (formState.directions.length === 0) {
            newErrors.directions = 'Оберіть хоча б один напрям';
        }

        if (!formState.description.trim()) {
            newErrors.description = 'Опис обовʼязковий';
        } else if (countWords(formState.description) > MAX_WORDS) {
            newErrors.description = `Максимум ${MAX_WORDS} слів`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        console.log('[createCommunity] form data:', {
            name: formState.name,
            directions: formState.directions,
            description: formState.description,
            avatar: formState.avatar,
        });
        // createCommunity(formState);
    };

    const descWords = countWords(formState.description);
    const isOverLimit = descWords > MAX_WORDS;

    return (
        <form className="form-box form-stack community-form" onSubmit={handleSubmit} noValidate>

            {/* Name */}
            <div className="form-group">
                <label className="form-label">
                    Назва спільноти <span className="required">*</span>
                </label>
                <input
                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    type="text"
                    value={formState.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Наприклад, Абстрактні люди..."
                    autoComplete="off"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Directions */}
            <div className="form-group">
                <label className="form-label">
                    Напрям <span className="required">*</span>
                </label>
                <MultiSelect
                    options={DIRECTIONS}
                    selected={formState.directions}
                    onChange={val => update('directions', val)}
                    error={errors.directions}
                />
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">
                    Опис <span className="required">*</span>
                    <span className={`word-count ${isOverLimit ? 'word-count--over' : ''}`}>
                        {descWords}/{MAX_WORDS}
                    </span>
                </label>
                <textarea
                    className={`form-input form-textarea ${errors.description || isOverLimit ? 'form-input--error' : ''}`}
                    value={formState.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Розкажіть про вашу спільноту..."
                    rows={5}
                />
                {(errors.description || isOverLimit) && (
                    <span className="field-error">
                        {errors.description || `Перевищено ліміт: ${descWords}/${MAX_WORDS} слів`}
                    </span>
                )}
            </div>

            {/* Avatar */}
            <div className="form-group">
                <label className="form-label">Аватар</label>
                <AvatarUpload
                    file={formState.avatar}
                    onChange={val => update('avatar', val)}
                    error={avatarError}
                />
            </div>

            {/* Submit */}
            <div className="form-actions community-form__actions">
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                    Створити
                </button>
            </div>
        </form>
    );
}
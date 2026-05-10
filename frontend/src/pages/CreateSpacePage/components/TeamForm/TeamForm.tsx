import { useState } from 'react';
import MultiSelect from '../../../../components/MultiSelect/MultiSelect';
import AvatarUpload from '../shared/AvatarUpload/AvatarUpload';
import { teamsApi } from '../../../../features/teams/teamsApi';
import './TeamForm.css';

const DIRECTIONS = ['web', 'mobile', 'gamedev', 'design', 'ml/ai', 'backend', 'devops', 'other'];
const MAX_WORDS = 300;

const countWords = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export interface TeamFormState {
    name: string;
    directions: string[];
    description: string;
    avatar: File | null;
}

interface TeamFormProps {
    formState: TeamFormState;
    onChange: (state: TeamFormState) => void;
}

type FormErrors = Partial<Record<keyof TeamFormState, string>>;

export default function TeamForm({ formState, onChange }: TeamFormProps) {
    const [errors, setErrors] = useState<FormErrors>({});
    const [avatarError, setAvatarError] = useState('');

    const update = <K extends keyof TeamFormState>(field: K, value: TeamFormState[K]) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
        if (field === 'avatar') setAvatarError('');
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formState.name.trim()) {
            newErrors.name = 'Назва команди обовʼязкова';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        try {
            let avatarUrl = '';
            if (formState.avatar) {
                const { uploadUrl, publicUrl } = await teamsApi.getPresignedUrl(
                    formState.avatar.name,
                    formState.avatar.type
                );
                
                await fetch(uploadUrl, {
                    method: 'PUT',
                    body: formState.avatar,
                    headers: { 'Content-Type': formState.avatar.type }
                });
                avatarUrl = publicUrl;
            }

            const team = await teamsApi.create({
                name: formState.name,
                description: formState.description,
                directions: formState.directions.map(d => DIRECTIONS.indexOf(d) + 1),
                avatarUrl
            });

            window.location.href = `/teams/${team.slug}`;
        } catch (err) {
            console.error('Failed to create team:', err);
            setAvatarError('Сталася помилка при створенні команди');
        }
    };

    const descWords = countWords(formState.description);
    const isOverLimit = descWords > MAX_WORDS;

    return (
        <form className="form-box form-stack team-form" onSubmit={handleSubmit} noValidate>

            {/* Name */}
            <div className="form-group">
                <label className="form-label">
                    Назва команди <span className="required">*</span>
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
                    placeholder="Розкажіть про вашу команду..."
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
            <div className="form-actions team-form__actions">
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                    Створити
                </button>
            </div>
        </form>
    );
}
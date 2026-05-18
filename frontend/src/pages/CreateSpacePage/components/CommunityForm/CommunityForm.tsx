import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../../../../components/MultiSelect/MultiSelect';
import AvatarUpload from '../shared/AvatarUpload/AvatarUpload';
import { communitiesApi } from '../../../../features/communities/communitiesApi';
import { getCategories, type Category } from '../../../../features/categories/categoryApi';
import './CommunityForm.css';

const MAX_WORDS = 300;

const countWords = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export interface CommunityFormState {
    name: string;
    directions: (string | number)[];
    description: string;
    avatar: File | null;
}

interface CommunityFormProps {
    formState: CommunityFormState;
    onChange: (state: CommunityFormState) => void;
}

type FormErrors = Partial<Record<keyof CommunityFormState, string>>;

export default function CommunityForm({ formState, onChange }: CommunityFormProps) {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<FormErrors>({});
    const [avatarError, setAvatarError] = useState('');
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadCats = async () => {
            try {
                const { data } = await getCategories();
                setAvailableCategories(data);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        loadCats();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !validate()) return;
        
        setIsSubmitting(true);
        setAvatarError('');
        try {
            let avatarUrl = '';
            if (formState.avatar) {
                const { uploadUrl, publicUrl } = await communitiesApi.getPresignedUrl(
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

            const community = await communitiesApi.create({
                name: formState.name,
                description: formState.description,
                directions: formState.directions.map(Number), // Map to numbers to be safe
                avatarUrl: avatarUrl || undefined
            });

            navigate(`/communities/${community.slug}`);
        } catch (err: any) {
            console.error('Failed to create community:', err);
            const errMsg = err?.response?.data?.message || 'Сталася помилка при створенні спільноти';
            setAvatarError(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
        } finally {
            setIsSubmitting(false);
        }
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
                    disabled={isSubmitting}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Directions */}
            <div className="form-group">
                <label className="form-label">
                    Напрям <span className="required">*</span>
                </label>
                <MultiSelect
                    options={availableCategories}
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
                    disabled={isSubmitting}
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
                <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-block"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Створення...' : 'Створити'}
                </button>
            </div>
        </form>
    );
}
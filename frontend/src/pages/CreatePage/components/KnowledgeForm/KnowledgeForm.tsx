import { useState } from 'react';
import MultiSelect from '../../../../components/MultiSelect/MultiSelect';
import UrlListInput from '../shared/UrlListInput';
import FileUpload from '../shared/FileUpload';
import { createCategory, type Category } from '../../../../features/categories/categoryApi';
import { createKnowledge } from '../../../../features/knowledges/knowledgeApi';

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface KnowledgeFormState {
    offerCategories: number[];
    offerDescription: string;
    requestCategories: number[];
    requestDescription: string;
    deadline: string;
    urls: string[];
    files: File[];
}

interface KnowledgeFormProps {
    formState: KnowledgeFormState;
    onChange: (state: KnowledgeFormState) => void;
    onClear: () => void;
    setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
    onSuccess: (id: string) => void;
    categories: Category[];
}

export default function KnowledgeForm({ formState, onChange, onClear,categories,setMessage,onSuccess }: KnowledgeFormProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormState, string>>>({});

    const update = (field: keyof KnowledgeFormState, value: any) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleCreateCategory = async (name: string) => {
        const { data: newCat } = await createCategory(name);
        return newCat;
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof KnowledgeFormState, string>> = {};

        if (formState.offerCategories.length === 0)
            newErrors.offerCategories = 'Оберіть хоча б одну категорію';

        if (!formState.offerDescription.trim())
            newErrors.offerDescription = 'Опис обовʼязковий';
        else if (countWords(formState.offerDescription) > 300)
            newErrors.offerDescription = 'Максимум 300 слів';

        if (formState.requestCategories.length === 0)
            newErrors.requestCategories = 'Оберіть хоча б одну категорію';

        if (!formState.requestDescription.trim())
            newErrors.requestDescription = 'Опис обовʼязковий';
        else if (countWords(formState.requestDescription) > 300)
            newErrors.requestDescription = 'Максимум 300 слів';

        if (!formState.deadline)
            newErrors.deadline = 'Дедлайн обовʼязковий';
        else if (new Date(formState.deadline) < new Date())
            newErrors.deadline = 'Дедлайн не може бути в минулому';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const result = await createKnowledge(formState);
            setMessage({ text: 'Knowledge успішно створено!', type: 'success' });  
            setTimeout(() => {
                onSuccess(result.data.id);
            }, 1000);
        } catch (error: any) {
            const backendError = error.response?.data?.message;
            setMessage({
                text: Array.isArray(backendError)
                    ? backendError.join('\n')
                    : backendError || 'Помилка створення Knowledge',
                type: 'error',
            });
        }
    };

    const offerDescWords = countWords(formState.offerDescription);
    const wantDescWords = countWords(formState.requestDescription);

    return (
        <form className="form-box form-stack" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">
                    Категорія — що пропонуєш <span className="required">*</span>
                </label>
                <MultiSelect
                    options={categories}
                    selected={formState.offerCategories}
                    onChange={val => update('offerCategories', val)}
                    onCreateOption={handleCreateCategory}
                    error={errors.offerCategories}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Опис — що пропонуєш <span className="required">*</span>
                    <span className="word-count">{offerDescWords}/300</span>
                </label>
                <textarea
                    className={`form-input form-textarea ${errors.offerDescription ? 'form-input--error' : ''}`}
                    value={formState.offerDescription}
                    onChange={e => update('offerDescription', e.target.value)}
                    placeholder="Що ти можеш запропонувати..."
                    rows={4}
                />
                {errors.offerDescription && <span className="field-error">{errors.offerDescription}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Категорія — що хочеш отримати <span className="required">*</span>
                </label>
                <MultiSelect
                    options={categories}
                    selected={formState.requestCategories}
                    onChange={val => update('requestCategories', val)}
                    onCreateOption={handleCreateCategory}
                    error={errors.requestCategories}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Опис — що хочеш отримати <span className="required">*</span>
                    <span className="word-count">{wantDescWords}/300</span>
                </label>
                <textarea
                    className={`form-input form-textarea ${errors.requestDescription ? 'form-input--error' : ''}`}
                    value={formState.requestDescription}
                    onChange={e => update('requestDescription', e.target.value)}
                    placeholder="Що ти хочеш отримати взамін..."
                    rows={4}
                />
                {errors.requestDescription && <span className="field-error">{errors.requestDescription}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Дедлайн <span className="required">*</span>
                </label>
                <input
                    className={`form-input ${errors.deadline ? 'form-input--error' : ''}`}
                    type="date"
                    value={formState.deadline}
                    onChange={e => update('deadline', e.target.value)}
                />
                {errors.deadline && <span className="field-error">{errors.deadline}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">Додаткові посилання</label>
                <UrlListInput
                    urls={formState.urls}
                    onChange={val => update('urls', val)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Додаткові файли</label>
                <FileUpload
                    files={formState.files}
                    onChange={val => update('files', val)}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn-clear" onClick={onClear}>
                    Очистити форму
                </button>
                <button type="submit" className="btn btn-primary">
                    Створити knowledge
                </button>
            </div>
        </form>
    );
}

export type { KnowledgeFormState };
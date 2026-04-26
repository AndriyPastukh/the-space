import { useState } from 'react';
import MultiSelect from '../shared/MultiSelect';
import UrlListInput from '../shared/UrlListInput';
import FileUpload from '../shared/FileUpload';
import './KnowledgeForm.css';

const CATEGORIES = ['web', 'mobile', 'gamedev', 'design', 'ml/ai', 'backend', 'devops', 'other'];

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface KnowledgeFormState {
    offerCategories: string[];
    offerDescription: string;
    wantCategories: string[];
    wantDescription: string;
    deadline: string;
    urls: string[];
    files: File[];
}

interface KnowledgeFormProps {
    formState: KnowledgeFormState;
    onChange: (state: KnowledgeFormState) => void;
    onClear: () => void;
}

export default function KnowledgeForm({ formState, onChange, onClear }: KnowledgeFormProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormState, string>>>({});

    const update = (field: keyof KnowledgeFormState, value: any) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof KnowledgeFormState, string>> = {};

        if (formState.offerCategories.length === 0)
            newErrors.offerCategories = 'Оберіть хоча б одну категорію';

        if (!formState.offerDescription.trim())
            newErrors.offerDescription = 'Опис обовʼязковий';
        else if (countWords(formState.offerDescription) > 300)
            newErrors.offerDescription = 'Максимум 300 слів';

        if (formState.wantCategories.length === 0)
            newErrors.wantCategories = 'Оберіть хоча б одну категорію';

        if (!formState.wantDescription.trim())
            newErrors.wantDescription = 'Опис обовʼязковий';
        else if (countWords(formState.wantDescription) > 300)
            newErrors.wantDescription = 'Максимум 300 слів';

        if (!formState.deadline)
            newErrors.deadline = 'Дедлайн обовʼязковий';
        else if (new Date(formState.deadline) < new Date())
            newErrors.deadline = 'Дедлайн не може бути в минулому';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        console.log('Knowledge form data:', formState);
        // createKnowledge(formState);
    };

    const offerDescWords = countWords(formState.offerDescription);
    const wantDescWords = countWords(formState.wantDescription);

    return (
        <form className="create-form" onSubmit={handleSubmit}>
            {/* Offer Categories */}
            <div className="form-group">
                <label className="form-label">
                    Категорія — що пропонуєш <span className="required">*</span>
                </label>
                <MultiSelect
                    options={CATEGORIES}
                    selected={formState.offerCategories}
                    onChange={val => update('offerCategories', val)}
                    error={errors.offerCategories}
                />
            </div>

            {/* Offer Description */}
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

            {/* Want Categories */}
            <div className="form-group">
                <label className="form-label">
                    Категорія — що хочеш отримати <span className="required">*</span>
                </label>
                <MultiSelect
                    options={CATEGORIES}
                    selected={formState.wantCategories}
                    onChange={val => update('wantCategories', val)}
                    error={errors.wantCategories}
                />
            </div>

            {/* Want Description */}
            <div className="form-group">
                <label className="form-label">
                    Опис — що хочеш отримати <span className="required">*</span>
                    <span className="word-count">{wantDescWords}/300</span>
                </label>
                <textarea
                    className={`form-input form-textarea ${errors.wantDescription ? 'form-input--error' : ''}`}
                    value={formState.wantDescription}
                    onChange={e => update('wantDescription', e.target.value)}
                    placeholder="Що ти хочеш отримати взамін..."
                    rows={4}
                />
                {errors.wantDescription && <span className="field-error">{errors.wantDescription}</span>}
            </div>

            {/* Deadline */}
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

            {/* URLs */}
            <div className="form-group">
                <label className="form-label">Додаткові посилання</label>
                <UrlListInput
                    urls={formState.urls}
                    onChange={val => update('urls', val)}
                />
            </div>

            {/* Files */}
            <div className="form-group">
                <label className="form-label">Додаткові файли</label>
                <FileUpload
                    files={formState.files}
                    onChange={val => update('files', val)}
                />
            </div>

            {/* Actions */}
            <div className="form-actions">
                <button type="button" className="btn-clear" onClick={onClear}>
                    Очистити форму
                </button>
                <button type="submit" className="btn-primary">
                    Створити knowledge
                </button>
            </div>
        </form>
    );
}

export type { KnowledgeFormState };
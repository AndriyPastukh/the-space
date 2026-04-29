import { useState } from 'react';
import MultiSelect from '../shared/MultiSelect';
import UrlListInput from '../shared/UrlListInput';
import FileUpload from '../shared/FileUpload';

const CATEGORIES = ['web', 'mobile', 'gamedev', 'design', 'ml/ai', 'backend', 'devops', 'other'];

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface TaskFormState {
    title: string;
    categories: string[];
    description: string;
    deadline: string;
    urls: string[];
    files: File[];
}

interface TaskFormProps {
    formState: TaskFormState;
    onChange: (state: TaskFormState) => void;
    onClear: () => void;
}

export default function TaskForm({ formState, onChange, onClear }: TaskFormProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof TaskFormState, string>>>({});

    const update = (field: keyof TaskFormState, value: any) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors: Partial<Record<keyof TaskFormState, string>> = {};

        if (!formState.title.trim()) {
            newErrors.title = 'Заголовок обовʼязковий';
        } else if (countWords(formState.title) > 100) {
            newErrors.title = 'Максимум 100 слів';
        }

        if (formState.categories.length === 0) {
            newErrors.categories = 'Оберіть хоча б одну категорію';
        }

        if (!formState.description.trim()) {
            newErrors.description = 'Опис обовʼязковий';
        } else if (countWords(formState.description) > 300) {
            newErrors.description = 'Максимум 300 слів';
        }

        if (!formState.deadline) {
            newErrors.deadline = 'Дедлайн обовʼязковий';
        } else if (new Date(formState.deadline) < new Date()) {
            newErrors.deadline = 'Дедлайн не може бути в минулому';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        console.log('Task form data:', formState);
        // createTask(formState);
    };

    const titleWords = countWords(formState.title);
    const descWords = countWords(formState.description);

    return (
        <form className="create-form" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
                <label className="form-label">
                    Заголовок <span className="required">*</span>
                    <span className="word-count">{titleWords}/100</span>
                </label>
                <input
                    className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                    type="text"
                    value={formState.title}
                    onChange={e => update('title', e.target.value)}
                    placeholder="Назва таску..."
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            {/* Categories */}
            <div className="form-group">
                <label className="form-label">
                    Категорія <span className="required">*</span>
                </label>
                <MultiSelect
                    options={CATEGORIES}
                    selected={formState.categories}
                    onChange={val => update('categories', val)}
                    error={errors.categories}
                />
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">
                    Опис <span className="required">*</span>
                    <span className="word-count">{descWords}/300</span>
                </label>
                <textarea
                    className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
                    value={formState.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Детальний опис таску..."
                    rows={5}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
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
                    Створити таск
                </button>
            </div>
        </form>
    );
}

export type { TaskFormState };
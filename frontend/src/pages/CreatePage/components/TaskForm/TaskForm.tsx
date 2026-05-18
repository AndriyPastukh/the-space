import { useState } from 'react';
import MultiSelect from '../../../../components/MultiSelect/MultiSelect';
import UrlListInput from '../shared/UrlListInput';
import FileUpload from '../shared/FileUpload';
import { createCategory, type Category } from '../../../../features/categories/categoryApi';
import { createTask } from '../../../../features/tasks/taskApi';

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

interface TaskFormState {
    title: string;
    categories: number[];
    description: string;
    deadline: string;
    urls: string[];
    files: File[];
}

interface TaskFormProps {
    formState: TaskFormState;
    onChange: (state: TaskFormState) => void;
    onClear: () => void;
    setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
    onSuccess: (id: string) => void;
    categories: Category[];
    mode?: 'create' | 'edit';
    submitButtonText?: string;
    onSubmit?: (state: TaskFormState) => Promise<void>;
}

export default function TaskForm({
    formState,
    onChange,
    onClear,
    categories,
    setMessage,
    onSuccess,
    mode = 'create',
    submitButtonText,
    onSubmit,
}: TaskFormProps) {
    const [errors, setErrors] = useState<Partial<Record<keyof TaskFormState, string>>>({});

    const update = (field: keyof TaskFormState, value: any) => {
        onChange({ ...formState, [field]: value });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleCreateCategory = async (name: string) => {
        const { data: newCat } = await createCategory(name);
        return newCat;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (mode === 'edit' && onSubmit) {
            try {
                await onSubmit(formState);
            } catch (error: any) {
                const backendError = error.response?.data?.message || error.response?.data;
                setMessage({
                    text: Array.isArray(backendError)
                        ? backendError.join('\n')
                        : backendError || 'Помилка оновлення Task',
                    type: 'error',
                });
            }
            return;
        }

        try {
            const result = await createTask(formState);
            setMessage({ text: 'Task успішно створено!', type: 'success' });
            setTimeout(() => {
                onSuccess(result.data.id);
            }, 1000);
        } catch (error: any) {
            const backendError = error.response?.data?.message || error.response?.data;
            setMessage({
                text: Array.isArray(backendError)
                    ? backendError.join('\n')
                    : backendError || 'Помилка створення Task',
                type: 'error',
            });
        }
    };

    const titleWords = countWords(formState.title);
    const descWords = countWords(formState.description);

    return (
        <form className="form-box form-stack" onSubmit={handleSubmit}>
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

            <div className="form-group">
                <label className="form-label">
                    Категорія <span className="required">*</span>
                </label>
                <MultiSelect
                    options={categories}
                    selected={formState.categories}
                    onChange={val => update('categories', val)}
                    onCreateOption={handleCreateCategory}
                    error={errors.categories}
                />
            </div>

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
                {mode === 'create' && (
                    <button type="button" className="btn-clear" onClick={onClear}>
                        Очистити форму
                    </button>
                )}
                <button type="submit" className="btn btn-primary">
                    {submitButtonText || 'Створити таск'}
                </button>
            </div>
        </form>
    );
}

export type { TaskFormState };
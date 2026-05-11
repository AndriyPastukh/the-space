import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperienceCard from './components/ExperienceCard/ExperienceCard';
import type { ExperienceStatus } from './components/ExperienceCard/ExperienceCard';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { useKnowledges } from '../../hooks/useKnowledges';
import './MyCreatedExperiencesPage.css';

type TypeTab = 'CREATED' | 'ASSIGNED';
type ContentTab = 'TASK' | 'KNOWLEDGE';

const STATUS_TABS: { value: ExperienceStatus; label: string }[] = [
    { value: 'OPEN', label: 'Відкриті' },
    { value: 'IN_PROGRESS', label: 'В процесі' },
    { value: 'REVIEW', label: 'На перевірці' },
    { value: 'COMPLETED', label: 'Завершені' },
];

export default function MyCreatedExperiencesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [typeTab, setTypeTab] = useState<TypeTab>('CREATED');
    const [contentTab, setContentTab] = useState<ContentTab>('TASK');
    const [statusTab, setStatusTab] = useState<ExperienceStatus>('OPEN');

    const tasks = useTasks({
        page: 1,
        limit: 100,
        search: '',
        categoryIds: [],
        authorId: typeTab === 'CREATED' ? user?.id : undefined,
        assigneeId: typeTab === 'ASSIGNED' ? user?.id : undefined,
        enabled: !!user && contentTab === 'TASK',
    });

    const knowledges = useKnowledges({
        page: 1,
        limit: 100,
        search: '',
        offerCategoryIds: [],
        requestCategoryIds: [],
        authorId: typeTab === 'CREATED' ? user?.id : undefined,
        enabled: !!user && contentTab === 'KNOWLEDGE',
    });

    const items = contentTab === 'TASK' ? tasks.data : knowledges.data;
    const isLoading = contentTab === 'TASK' ? tasks.isLoading : knowledges.isLoading;

    const countByStatus = (status: ExperienceStatus) =>
        items.filter(i => i.status === status).length;

    const filtered = useMemo(() =>
        items.filter(i => i.status === statusTab),
        [items, statusTab]
    );

    return (
        <div className="my-experiences-page">
            <div className="my-experiences-container">

                {/* Header */}
                <div className="my-experiences-header">
                    <h1 className="my-experiences-title">Мої досвіди</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/create-experience')}
                    >
                        + Створити досвід
                    </button>
                </div>

                {/* Role Tabs */}
                <div className="type-tabs" style={{ marginBottom: '10px' }}>
                    <button
                        className={`type-tab ${typeTab === 'CREATED' ? 'type-tab--active' : ''}`}
                        onClick={() => setTypeTab('CREATED')}
                    >
                        Я замовник
                    </button>
                    <button
                        className={`type-tab ${typeTab === 'ASSIGNED' ? 'type-tab--active' : ''}`}
                        onClick={() => setTypeTab('ASSIGNED')}
                    >
                        Я виконавець
                    </button>
                </div>

                {/* Content type tabs */}
                <div className="type-tabs">
                    <button
                        className={`type-tab ${contentTab === 'TASK' ? 'type-tab--active' : ''}`}
                        onClick={() => { setContentTab('TASK'); setStatusTab('OPEN'); }}
                    >
                        Завдання
                    </button>
                    <button
                        className={`type-tab ${contentTab === 'KNOWLEDGE' ? 'type-tab--active' : ''}`}
                        onClick={() => { setContentTab('KNOWLEDGE'); setStatusTab('OPEN'); }}
                    >
                        Знання
                    </button>
                </div>

                {/* Status tabs */}
                <div className="status-tabs">
                    {STATUS_TABS.map(s => (
                        <button
                            key={s.value}
                            className={`status-tab ${statusTab === s.value ? 'status-tab--active' : ''}`}
                            onClick={() => setStatusTab(s.value)}
                        >
                            {s.label}
                            <span className="status-tab__count">{countByStatus(s.value)}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="my-experiences-empty">
                        <p>Завантаження...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="my-experiences-empty">
                        <span className="my-experiences-empty__icon">📋</span>
                        <p>У вас ще немає досвідів у цій категорії...</p>
                        {typeTab === 'CREATED' && (
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/create-experience')}
                            >
                                Створити перший досвід
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="my-experiences-list">
                        {filtered.map(item => (
                            <ExperienceCard key={item.id} {...item as any} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
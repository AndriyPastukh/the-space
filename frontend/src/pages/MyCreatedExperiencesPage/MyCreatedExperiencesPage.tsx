import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperienceCard from './components/ExperienceCard/ExperienceCard';
import type { ExperienceCardProps, ExperienceStatus } from './components/ExperienceCard/ExperienceCard';
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

const EMPTY_ARRAY: number[] = [];

export default function MyCreatedExperiencesPage() {
    const navigate = useNavigate();
    const { user, isAuthLoading } = useAuth();
    const [typeTab, setTypeTab] = useState<TypeTab>('CREATED');
    const [contentTab, setContentTab] = useState<ContentTab>('TASK');
    const [statusTab, setStatusTab] = useState<ExperienceStatus>('OPEN');

    const isTaskEnabled = !!user && contentTab === 'TASK';
    const isKnowledgeEnabled = !!user && contentTab === 'KNOWLEDGE' && typeTab === 'CREATED';

    const tasks = useTasks({
        page: 1,
        limit: 100,
        search: '',
        categoryIds: EMPTY_ARRAY,
        authorId: typeTab === 'CREATED' && user?.id ? Number(user.id) : undefined,
        assigneeId: typeTab === 'ASSIGNED' && user?.id ? Number(user.id) : undefined,
        enabled: isTaskEnabled,
    });

    const knowledges = useKnowledges({
        page: 1,
        limit: 100,
        search: '',
        offerCategoryIds: EMPTY_ARRAY,
        requestCategoryIds: EMPTY_ARRAY,
        authorId: typeTab === 'CREATED' && user?.id ? Number(user.id) : undefined,
        enabled: isKnowledgeEnabled,
    });

    const mappedTasks = useMemo(() => {
        return (tasks.data || []).map(task => {
            let experienceStatus: ExperienceStatus = 'OPEN';
            if (task.status === 'IN_PROGRESS') {
                experienceStatus = 'IN_PROGRESS';
            } else if (task.status === 'COMPLETED') {
                experienceStatus = 'COMPLETED';
            } else if (task.status === 'REVIEW') {
                experienceStatus = 'REVIEW';
            }

            return {
                type: 'TASK' as const,
                id: String(task.id),
                title: task.title || '',
                description: task.description || '',
                tags: task.tags || task.categories?.map((c: { name: string }) => c.name) || [],
                createdAt: task.createdAt,
                status: experienceStatus,
                applications: (task.applications || []).map((app: {
                    id: string | number;
                    applicant?: {
                        id?: number;
                        firstName?: string;
                        lastName?: string;
                        avatarUrl?: string;
                        rating?: number;
                    };
                    status?: 'PENDING' | 'ACCEPTED' | 'SUBMITTED_FOR_REVIEW' | 'COMPLETED' | 'REJECTED';
                    appliedAt?: string;
                }) => ({
                    id: String(app.id),
                    applicant: {
                        id: Number(app.applicant?.id || 0),
                        firstName: app.applicant?.firstName || '',
                        lastName: app.applicant?.lastName || '',
                        avatarUrl: app.applicant?.avatarUrl || '',
                        rating: Number(app.applicant?.rating || 0),
                    },
                    status: app.status || 'PENDING',
                    appliedAt: app.appliedAt || task.createdAt,
                })),
            };
        });
    }, [tasks.data]);

    const mappedKnowledges = useMemo(() => {
        return (knowledges.data || []).map(k => {
            return {
                type: 'KNOWLEDGE' as const,
                id: String(k.id),
                offer: {
                    tags: k.offer?.tags || k.offerCategories?.map((c: { name: string }) => c.name) || [],
                    description: k.offerDescription || k.offer?.description || '',
                },
                request: {
                    tags: k.want?.tags || k.requestCategories?.map((c: { name: string }) => c.name) || [],
                    description: k.requestDescription || k.want?.description || '',
                },
                createdAt: k.createdAt,
            };
        });
    }, [knowledges.data]);

    const items = useMemo(() => {
        if (contentTab === 'TASK') {
            return mappedTasks;
        } else {
            if (typeTab === 'ASSIGNED') {
                return [];
            }
            return mappedKnowledges;
        }
    }, [contentTab, typeTab, mappedTasks, mappedKnowledges]);

    const isLoading = contentTab === 'TASK' ? tasks.isLoading : knowledges.isLoading;
    const error = contentTab === 'TASK' ? tasks.error : (typeTab === 'CREATED' ? knowledges.error : null);

    const countByStatus = (status: ExperienceStatus) =>
        items.filter((i: ExperienceCardProps) => i.type === 'TASK' && i.status === status).length;

    const filtered = useMemo(() => {
        if (contentTab === 'KNOWLEDGE') return items;
        return items.filter((i: ExperienceCardProps) => i.type === 'TASK' && i.status === statusTab);
    }, [items, statusTab, contentTab]);

    if (isAuthLoading) {
        return (
            <div className="my-experiences-page">
                <div className="my-experiences-container">
                    <div className="my-experiences-empty">
                        <p>Завантаження профілю...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="my-experiences-page">
                <div className="my-experiences-container">
                    <div className="my-experiences-empty">
                        <span className="my-experiences-empty__icon">🔒</span>
                        <p>Будь ласка, авторизуйтесь, щоб переглянути свої досвіди.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Увійти
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        onClick={() => { setTypeTab('CREATED'); setStatusTab('OPEN'); }}
                    >
                        Я замовник
                    </button>
                    <button
                        className={`type-tab ${typeTab === 'ASSIGNED' ? 'type-tab--active' : ''}`}
                        onClick={() => { setTypeTab('ASSIGNED'); setStatusTab('OPEN'); }}
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

                {/* Status tabs (Hidden for Knowledge) */}
                {contentTab === 'TASK' && (
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
                )}

                {/* API Error Notification */}
                {error && (
                    <div style={{
                        background: 'rgba(248, 113, 113, 0.12)',
                        border: '1px solid rgba(248, 113, 113, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#f87171',
                        marginBottom: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Content rendering */}
                {isLoading ? (
                    <div className="my-experiences-empty">
                        <p>Завантаження досвідів...</p>
                    </div>
                ) : typeTab === 'ASSIGNED' && contentTab === 'KNOWLEDGE' ? (
                    <div className="my-experiences-empty">
                        <span className="my-experiences-empty__icon">💡</span>
                        <p>Отримання знань у ролі виконавця наразі не підтримується на бекенді.</p>
                        <span className="text-sm-muted" style={{ display: 'block', marginTop: '6px' }}>
                            Ця функція потребує розширення API для призначених знань.
                        </span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="my-experiences-empty">
                        {contentTab === 'TASK' ? (
                            typeTab === 'CREATED' ? (
                                <>
                                    <span className="my-experiences-empty__icon">📋</span>
                                    <p>Ви ще не створили жодного завдання...</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/create-experience')}
                                    >
                                        Створити завдання
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="my-experiences-empty__icon">🔧</span>
                                    <p>Ви ще не виконуєте жодного завдання...</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/search-experience?type=task')}
                                    >
                                        Знайти завдання
                                    </button>
                                </>
                            )
                        ) : (
                            typeTab === 'CREATED' ? (
                                <>
                                    <span className="my-experiences-empty__icon">💡</span>
                                    <p>Ви ще не поділилися своїми знаннями...</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/create-experience')}
                                    >
                                        Поділитися знаннями
                                    </button>
                                </>
                            ) : null
                        )}
                    </div>
                ) : (
                    <div className="my-experiences-list">
                        {filtered.map((item: ExperienceCardProps) => (
                            <ExperienceCard key={item.id} {...item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
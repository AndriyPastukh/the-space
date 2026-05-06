import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperienceCard from './components/ExperienceCard/ExperienceCard';
import type { ExperienceStatus } from './components/ExperienceCard/ExperienceCard';
import './MyCreatedExperiencesPage.css';

type TypeTab = 'TASK' | 'KNOWLEDGE';

const mockCreatedTasks = [
    {
        type: 'TASK' as const,
        id: 'task-1',
        title: 'Створити дизайн для сайту авто',
        description: 'Текст для перевірки великого контейнера. Текст для перевірки великого контейнера...',
        tags: ['design', 'figma', 'html', 'css'],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'OPEN' as ExperienceStatus,
        applications: [
            {
                id: 'app-1',
                applicant: { firstName: 'Іван', lastName: 'М.', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', rating: 4.8 },
                status: 'PENDING' as const,
                appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'app-2',
                applicant: { firstName: 'Артем', lastName: 'К.', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', rating: 5.0 },
                status: 'PENDING' as const,
                appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
        ],
    },
    {
        type: 'TASK' as const,
        id: 'task-2',
        title: 'Створити навігаційну панель',
        description: 'Короткий опис завдання...',
        tags: ['react', 'frontend'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'REVIEW' as ExperienceStatus,
        applications: [
            {
                id: 'app-3',
                applicant: { firstName: 'Олег', lastName: 'П.', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', rating: 4.5 },
                status: 'SUBMITTED_FOR_REVIEW' as const,
                appliedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            },
        ],
    },
];

const mockCreatedKnowledges = [
    {
        type: 'KNOWLEDGE' as const,
        id: 'know-1',
        offer: { tags: ['python', 'api'], description: 'основи api в python а також CRUD операції' },
        request: { tags: ['design', 'figma'], description: 'дизайну в Figma, підбір кольорів і компоненти' },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'IN_PROGRESS' as ExperienceStatus,
        applications: [
            {
                id: 'app-4',
                applicant: { firstName: 'Марія', lastName: 'В.', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', rating: 4.9 },
                status: 'ACCEPTED' as const,
                appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            },
        ],
    },
];

const STATUS_TABS: { value: ExperienceStatus; label: string }[] = [
    { value: 'OPEN', label: 'Відкриті' },
    { value: 'IN_PROGRESS', label: 'В процесі' },
    { value: 'REVIEW', label: 'На перевірці' },
    { value: 'COMPLETED', label: 'Завершені' },
];

export default function MyCreatedExperiencesPage() {
    const navigate = useNavigate();
    const [typeTab, setTypeTab] = useState<TypeTab>('TASK');
    const [statusTab, setStatusTab] = useState<ExperienceStatus>('OPEN');

    const allItems = typeTab === 'TASK' ? mockCreatedTasks : mockCreatedKnowledges;

    const countByStatus = (status: ExperienceStatus) =>
        allItems.filter(i => i.status === status).length;

    const filtered = useMemo(() =>
        allItems.filter(i => i.status === statusTab),
        [typeTab, statusTab]
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

                {/* Type tabs */}
                <div className="type-tabs">
                    <button
                        className={`type-tab ${typeTab === 'TASK' ? 'type-tab--active' : ''}`}
                        onClick={() => { setTypeTab('TASK'); setStatusTab('OPEN'); }}
                    >
                        Завдання
                    </button>
                    <button
                        className={`type-tab ${typeTab === 'KNOWLEDGE' ? 'type-tab--active' : ''}`}
                        onClick={() => { setTypeTab('KNOWLEDGE'); setStatusTab('OPEN'); }}
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
                {filtered.length === 0 ? (
                    <div className="my-experiences-empty">
                        <span className="my-experiences-empty__icon">📋</span>
                        <p>У вас ще немає створених досвідів...</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/create-experience')}
                        >
                            Створити перший досвід
                        </button>
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
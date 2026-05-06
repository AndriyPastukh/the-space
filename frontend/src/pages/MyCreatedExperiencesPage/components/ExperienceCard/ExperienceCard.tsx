import ApplicationRow from '../ApplicationRow/ApplicationRow';
import './ExperienceCard.css';

type ExperienceStatus = 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

interface Application {
    id: string;
    applicant: {
        firstName: string;
        lastName: string;
        avatarUrl: string;
        rating: number;
    };
    status: 'PENDING' | 'ACCEPTED' | 'SUBMITTED_FOR_REVIEW' | 'COMPLETED' | 'REJECTED';
    appliedAt: string;
    rating?: number;
}

interface TaskCardData {
    type: 'TASK';
    id: string;
    title: string;
    description: string;
    tags: string[];
    createdAt: string;
    status: ExperienceStatus;
    applications: Application[];
}

interface KnowledgeCardData {
    type: 'KNOWLEDGE';
    id: string;
    offer: { tags: string[]; description: string };
    request: { tags: string[]; description: string };
    createdAt: string;
    status: ExperienceStatus;
    applications: Application[];
}

type ExperienceCardProps = TaskCardData | KnowledgeCardData;

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'щойно';
    if (h < 24) return `${h} год. тому`;
    return `${Math.floor(h / 24)} дн. тому`;
}

const MAX_TAGS = 3;

function TagList({ tags }: { tags: string[] }) {
    const visible = tags.slice(0, MAX_TAGS);
    const hidden = tags.length - MAX_TAGS;
    return (
        <div className="tags">
            {visible.map(t => <span key={t} className="tag">{t}</span>)}
            {hidden > 0 && <span className="tag tag-more">+{hidden}</span>}
        </div>
    );
}

export default function ExperienceCard(props: ExperienceCardProps) {
    const handleAccept = (appId: string) => console.log('accept', appId);
    const handleReject = (appId: string) => console.log('reject', appId);
    const handleCancel = (appId: string) => console.log('cancel', appId);
    const handleRework = (appId: string) => console.log('rework', appId);
    const handleAcceptWork = (appId: string) => console.log('acceptWork', appId);
    const handleChat = (appId: string) => console.log('chat', appId);
    const handleLeaveReview = (appId: string) => console.log('leaveReview', appId);
    const handleEdit = () => console.log('edit', props.id);
    const handleDelete = () => console.log('delete', props.id);

    return (
        <div className="experience-card card">
            {/* Card header */}
            <div className="experience-card__header">
                <div className="experience-card__meta">
                    <span className={`experience-card__type-badge ${props.type === 'TASK' ? 'badge--task' : 'badge--knowledge'}`}>
                        {props.type === 'TASK' ? 'Завдання' : 'Знання'}
                    </span>
                    <span className="experience-card__time">{timeAgo(props.createdAt)}</span>
                </div>
                <div className="experience-card__actions">
                    <button className="btn btn-outline btn-sm" onClick={handleEdit}>Редагувати</button>
                    <button className="btn btn-outline btn-sm experience-card__btn--delete" onClick={handleDelete}>Видалити</button>
                </div>
            </div>

            {/* Task body */}
            {props.type === 'TASK' && (
                <div className="experience-card__body">
                    <h3 className="experience-card__title">{props.title}</h3>
                    <p className="experience-card__desc">{props.description}</p>
                    <TagList tags={props.tags} />
                </div>
            )}

            {/* Knowledge body */}
            {props.type === 'KNOWLEDGE' && (
                <div className="experience-card__body">
                    <div className="knowledge-blocks">
                        <div className="knowledge-block knowledge-block--offer">
                            <span className="knowledge-block__label">Знає:</span>
                            <TagList tags={props.offer.tags} />
                            <p className="knowledge-block__desc">{props.offer.description}</p>
                        </div>
                        <div className="knowledge-block knowledge-block--request">
                            <span className="knowledge-block__label">Шукає:</span>
                            <TagList tags={props.request.tags} />
                            <p className="knowledge-block__desc">{props.request.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Applications */}
            {props.applications.length > 0 && (
                <div className="experience-card__applications">
                    <span className="experience-card__apps-label">
                        Заявки ({props.applications.length})
                    </span>
                    {props.applications.map(app => (
                        <ApplicationRow
                            key={app.id}
                            {...app}
                            experienceStatus={props.status}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            onCancel={handleCancel}
                            onRework={handleRework}
                            onAcceptWork={handleAcceptWork}
                            onChat={handleChat}
                            onLeaveReview={handleLeaveReview}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export type { ExperienceCardProps, ExperienceStatus };
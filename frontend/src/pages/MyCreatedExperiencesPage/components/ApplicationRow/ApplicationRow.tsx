import './ApplicationRow.css';

interface Applicant {
    firstName: string;
    lastName: string;
    avatarUrl: string;
    rating: number;
}

interface ApplicationRowProps {
    id: string;
    applicant: Applicant;
    status: 'PENDING' | 'ACCEPTED' | 'SUBMITTED_FOR_REVIEW' | 'COMPLETED' | 'REJECTED';
    appliedAt: string;
    experienceStatus: 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
    rating?: number;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onCancel?: (id: string) => void;
    onRework?: (id: string) => void;
    onAcceptWork?: (id: string) => void;
    onChat?: (id: string) => void;
    onLeaveReview?: (id: string) => void;
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=48`;

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'щойно';
    if (h < 24) return `${h} год. тому`;
    return `${Math.floor(h / 24)} дн. тому`;
}

export default function ApplicationRow({
    id, applicant, appliedAt, experienceStatus, rating,
    onAccept, onReject, onCancel, onRework, onAcceptWork, onChat, onLeaveReview,
}: ApplicationRowProps) {
    const name = `${applicant.firstName} ${applicant.lastName}`;

    return (
        <div className="app-row">
            <div className="app-row__left">
                <img
                    src={getAvatar(applicant.avatarUrl, name)}
                    alt={name}
                    className="app-row__avatar"
                />
                <div className="app-row__info">
                    <span className="app-row__name">{name}</span>
                    <span className="app-row__rating">★ {applicant.rating}</span>
                </div>
            </div>

            <div className="app-row__actions">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onChat?.(id)}
                >
                    💬 Чат
                </button>

                {/* OPEN — Reject / Accept */}
                {experienceStatus === 'OPEN' && (
                    <>
                        <button className="btn btn-outline btn-sm app-row__btn--danger" onClick={() => onReject?.(id)}>
                            Відхилити
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => onAccept?.(id)}>
                            Прийняти
                        </button>
                    </>
                )}

                {/* IN_PROGRESS — Cancel */}
                {experienceStatus === 'IN_PROGRESS' && (
                    <button className="btn btn-outline btn-sm app-row__btn--danger" onClick={() => onCancel?.(id)}>
                        Скасувати
                    </button>
                )}

                {/* REVIEW — Cancel / Rework / Accept work OR rating block */}
                {experienceStatus === 'REVIEW' && !rating && (
                    <>
                        <button className="btn btn-outline btn-sm app-row__btn--danger" onClick={() => onCancel?.(id)}>
                            Скасувати
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => onRework?.(id)}>
                            На доопрацювання
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => onAcceptWork?.(id)}>
                            Прийняти роботу
                        </button>
                    </>
                )}

                {experienceStatus === 'REVIEW' && rating && (
                    <button className="btn btn-outline btn-sm" onClick={() => onLeaveReview?.(id)}>
                        {'★'.repeat(rating)} Залишити відгук
                    </button>
                )}

                {/* COMPLETED — rating */}
                {experienceStatus === 'COMPLETED' && rating && (
                    <span className="app-row__completed-rating">
                        {'★'.repeat(rating)} {rating}/5
                    </span>
                )}
            </div>

            <span className="app-row__time">{timeAgo(appliedAt)}</span>
        </div>
    );
}

export type { ApplicationRowProps };
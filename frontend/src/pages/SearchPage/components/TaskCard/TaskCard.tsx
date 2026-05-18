import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import "./TaskCard.css";

interface Category {
    id: number;
    name: string;
}

interface Author {
    id: string;
    name: string;
    avatarUrl: string;
    rating: number;
    reviewsCount: number;
}

interface TaskCardProps {
    id: string;
    title: string;
    description: string;
    categories: Category[];
    createdAt: string;
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
    author: Author;
    statistics: {
        viewsCount: number;
        proposalsCount: number;
    };
    viewer: {
        isSaved: boolean;
        myProposalId: string | null;
    };
    assignee?: {
        id: number;
        name: string;
        avatarUrl: string;
        rating: number;
    } | null;
}

export default function TaskCard({
    id,
    title,
    description,
    categories,
    createdAt,
    status,
    author,
    statistics,
    viewer,
    assignee,
}: TaskCardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user?.id ? Number(user.id) : null;

    const isOwner = currentUserId && Number(author.id) === currentUserId;
    const isAssignee = assignee && Number(assignee.id) === currentUserId;
    const hasApplied = Boolean(viewer.myProposalId);
    const hasOtherAssignee = assignee && Number(assignee.id) !== currentUserId;

    let buttonText = "Відгукнутись";
    let isDisabled = false;

    if (isOwner) {
        buttonText = "Ваше завдання";
        isDisabled = true;
    } else if (isAssignee) {
        buttonText = "Ви виконуєте це завдання";
        isDisabled = true;
    } else if (hasApplied) {
        buttonText = "Ви вже відгукнулися";
        isDisabled = true;
    } else if (hasOtherAssignee) {
        buttonText = "Виконавця вже обрано";
        isDisabled = true;
    } else if (status !== "OPEN") {
        buttonText = "Набір виконавця завершено";
        isDisabled = true;
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <div className="task-card" onClick={() => navigate(`/tasks/${id}`)}>
            <div className="card-header">
                <div className="card-author">
                    <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="author-avatar"
                        onError={(event) => {
                            (event.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=7c3aed&color=fff`;
                        }}
                    />
                    <div className="author-info">
                        <span className="author-name">{author.name}</span>
                        <span className="author-rating">★ {author.rating} ({author.reviewsCount})</span>
                    </div>
                </div>
                <span className="card-type card-type--task">Task</span>
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>

            <div className="card-categories">
                {categories.map((category) => (
                    <span key={category.id} className="category-chip">
                        {category.name}
                    </span>
                ))}
            </div>

            <div className="card-footer">
                <div className="card-stats">
                    <span className="stat">📋 {statistics.proposalsCount} пропозицій</span>
                    <span className="stat">🗓 {formatDate(createdAt)}</span>
                </div>
                <button
                    className="btn-apply"
                    disabled={isDisabled}
                    onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/tasks/${id}`);
                    }}
                    style={isDisabled ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}

export type { TaskCardProps };

import { useNavigate } from 'react-router-dom';
import './TaskCard.css';

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
    author: Author;
    statistics: {
        viewsCount: number;
        proposalsCount: number;
    };
    viewer: {
        isSaved: boolean;
        myProposalId: string | null;
    };
}

export default function TaskCard({
    id,
    title,
    description,
    categories,
    createdAt,
    author,
    statistics,
    viewer,
}: TaskCardProps) {
    const navigate = useNavigate();

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="task-card" onClick={() => navigate(`/tasks/${id}`)}>
            <div className="card-header">
                <div className="card-author">
                    <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="author-avatar"
                        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=7c3aed&color=fff`; }}
                    />
                    <div className="author-info">
                        <span className="author-name">{author.name}</span>
                        <span className="author-rating">⭐ {author.rating} ({author.reviewsCount})</span>
                    </div>
                </div>
                <span className="card-type card-type--task">Task</span>
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">{description}</p>

            <div className="card-categories">
                {categories.map(cat => (
                    <span key={cat.id} className="category-chip">{cat.name}</span>
                ))}
            </div>

            <div className="card-footer">
                <div className="card-stats">
                    <span className="stat">📋 {statistics.proposalsCount} пропозицій</span>
                    <span className="stat">📅 {formatDate(createdAt)}</span>
                </div>
                <button
                    className="btn-apply"
                    onClick={e => { e.stopPropagation(); navigate(`/tasks/${id}`); }}
                >
                    {viewer.myProposalId ? 'Переглянути' : 'Відгукнутись'}
                </button>
            </div>
        </div>
    );
}

export type { TaskCardProps };
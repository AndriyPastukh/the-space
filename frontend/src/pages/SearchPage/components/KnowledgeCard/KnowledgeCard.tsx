import { useNavigate } from 'react-router-dom';
import './KnowledgeCard.css';

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

interface KnowledgeCardProps {
    id: string;
    offer: { categories: Category[]; description: string };
    want: { categories: Category[]; description: string };
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
    onSave?: (id: string) => void;
}

export default function KnowledgeCard({
    id,
    offer,
    want,
    createdAt,
    author,
    statistics,
    viewer,
    onSave,
}: KnowledgeCardProps) {
    const navigate = useNavigate();

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="knowledge-card" onClick={() => navigate(`/knowledge/${id}`)}>
            <div className="card-header">
                <div className="card-author">
                    <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="author-avatar"
                        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=d946ef&color=fff`; }}
                    />
                    <div className="author-info">
                        <span className="author-name">{author.name}</span>
                        <span className="author-rating">⭐ {author.rating} ({author.reviewsCount})</span>
                    </div>
                </div>
                <span className="card-type card-type--knowledge">Knowledge</span>
            </div>

            <div className="knowledge-exchange">
                <div className="exchange-block exchange-block--offer">
                    <span className="exchange-label">Пропонує</span>
                    <div className="exchange-categories">
                        {offer.categories.map(cat => (
                            <span key={cat.id} className="category-chip category-chip--offer">{cat.name}</span>
                        ))}
                    </div>
                    <p className="exchange-description">{offer.description}</p>
                </div>

                <div className="exchange-divider">⇄</div>

                <div className="exchange-block exchange-block--want">
                    <span className="exchange-label">Шукає</span>
                    <div className="exchange-categories">
                        {want.categories.map(cat => (
                            <span key={cat.id} className="category-chip category-chip--want">{cat.name}</span>
                        ))}
                    </div>
                    <p className="exchange-description">{want.description}</p>
                </div>
            </div>

            <div className="card-footer">
                <div className="card-stats">
                    <span className="stat">📋 {statistics.proposalsCount} пропозицій</span>
                    <span className="stat">👁 {statistics.viewsCount}</span>
                    <span className="stat">📅 {formatDate(createdAt)}</span>
                </div>
                <div className="card-actions">
                    <button
                        className={`btn-save ${viewer.isSaved ? 'btn-save--active' : ''}`}
                        onClick={e => { e.stopPropagation(); onSave?.(id); }}
                        title={viewer.isSaved ? 'Збережено' : 'Зберегти'}
                    >
                        {viewer.isSaved ? '🔖' : '📌'}
                    </button>
                    <button
                        className="btn-apply"
                        onClick={e => { e.stopPropagation(); navigate(`/knowledge/${id}`); }}
                    >
                        {viewer.myProposalId ? 'Переглянути' : 'Відгукнутись'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export type { KnowledgeCardProps };
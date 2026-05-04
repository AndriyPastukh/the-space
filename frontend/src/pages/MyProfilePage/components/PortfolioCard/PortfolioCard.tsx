import './PortfolioCard.css';

interface PortfolioCardProps {
    id: string;
    type: 'TASK' | 'KNOWLEDGE';
    authorName: string;
    authorAvatarUrl: string;
    authorRating: number;
    actionLabel: string;
    categories: string[];
    title: string;
    review?: string;
    timeAgo: string;
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b1f6e&color=a855f7&size=48`;

export default function PortfolioCard({
    type, authorName, authorAvatarUrl, authorRating,
    actionLabel, categories, title, review, timeAgo,
}: PortfolioCardProps) {
    const MAX_VISIBLE = 3;
    const visibleCats = categories.slice(0, MAX_VISIBLE);
    const hiddenCount = categories.length - MAX_VISIBLE;

    return (
        <div className="portfolio-card">
            <div className="pcard-header">
                <img
                    src={getAvatar(authorAvatarUrl, authorName)}
                    alt={authorName}
                    className="pcard-avatar"
                />
                <span className="pcard-author-name">{authorName}</span>
                <span className="pcard-author-rating">★ {authorRating}</span>
                <span className="badge badge-new pcard-badge">нове</span>
                <span className="pcard-time">{timeAgo}</span>
            </div>

            <div className="pcard-action-row">
                <span className="pcard-action-label">{actionLabel}:</span>
                {title && <span className="pcard-title">{title}</span>}
                <div className="tags">
                    {visibleCats.map(cat => (
                        <span key={cat} className="tag">{cat}</span>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="tag tag-more">+{hiddenCount}</span>
                    )}
                </div>
            </div>

            {review && <p className="pcard-review">{review}</p>}
        </div>
    );
}

export type { PortfolioCardProps };
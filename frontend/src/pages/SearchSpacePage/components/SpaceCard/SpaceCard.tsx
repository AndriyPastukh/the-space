import { useNavigate } from 'react-router-dom';
import './SpaceCard.css';

interface SpaceCardProps {
    id: string;
    type: 'COMMUNITY' | 'TEAM';
    name: string;
    slug: string;
    avatarUrl: string;
    rating: number;
    membersCount: number;
    categories: string[];
    description: string;
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b1f6e&color=a855f7&size=80`;

const MAX_TAGS = 3;

export default function SpaceCard({
    type, name, slug, avatarUrl, rating,
    membersCount, categories, description,
}: SpaceCardProps) {
    const navigate = useNavigate();

    const visibleCats = categories.slice(0, MAX_TAGS);
    const hiddenCount = categories.length - MAX_TAGS;

    return (
        <div className="space-card card" onClick={() => navigate(type === 'COMMUNITY' ? `/communities/${slug}` : `/teams/${slug}`)}>
            <div className="space-card__header">
                <img src={getAvatar(avatarUrl, name)} alt={name} className="space-card__avatar" />
                <div className="space-card__info">
                    <div className="space-card__type-row">
                        <span className={`space-card__badge ${type === 'COMMUNITY' ? 'space-card__badge--community' : 'space-card__badge--team'}`}>
                            {type === 'COMMUNITY' ? 'Спільнота' : 'Команда'}
                        </span>
                        <span className="space-card__rating">★ {rating}</span>
                    </div>
                    <span className="space-card__name">{name}</span>
                    <span className="space-card__members">{membersCount} учасників</span>
                </div>
            </div>

            <div className="tags">
                {visibleCats.map(cat => <span key={cat} className="tag">{cat}</span>)}
                {hiddenCount > 0 && <span className="tag tag-more">+{hiddenCount}</span>}
            </div>

            <p className="space-card__desc">{description}</p>

            <div className="space-card__footer">
                <button
                    className="btn btn-primary btn-sm"
                    onClick={e => { e.stopPropagation(); navigate(type === 'COMMUNITY' ? `/communities/${slug}` : `/teams/${slug}`); }}
                >
                    Приєднатись
                </button>
            </div>
        </div>
    );
}

export type { SpaceCardProps };
import { useNavigate } from 'react-router-dom';
import './PersonCard.css';

interface PersonCardProps {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string;
    avatarUrl: string;
    rating: number;
    bio: string;
    directions: string[];
    interests: string[];
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=80`;

const MAX_TAGS = 3;

export default function PersonCard({
    id,
    firstName, lastName, nickname, avatarUrl,
    rating, bio, directions, interests,
}: PersonCardProps) {
    const navigate = useNavigate();
    const fullName = `${firstName} ${lastName}`;

    const renderTags = (tags: string[], colorClass: string) => {
        const visible = tags.slice(0, MAX_TAGS);
        const hidden = tags.length - MAX_TAGS;
        return (
            <div className="tags">
                {visible.map(t => <span key={t} className={`tag ${colorClass}`}>{t}</span>)}
                {hidden > 0 && <span className="tag tag-more">+{hidden}</span>}
            </div>
        );
    };

    return (
        <div className="person-card card" onClick={() => navigate(`/users/${id}`)}>
            <div className="person-card__header">
                <img src={getAvatar(avatarUrl, fullName)} alt={fullName} className="person-card__avatar" />
                <div className="person-card__info">
                    <div className="person-card__name-row">
                        <span className="person-card__name">{fullName}</span>
                        <span className="person-card__rating">★ {rating}</span>
                    </div>
                    <p className="person-card__bio">{bio}</p>
                </div>
            </div>

            <div className="person-card__tags">
                <span className="person-card__tag-label">Напрями:</span>
                {renderTags(directions, '')}
            </div>

            <div className="person-card__tags">
                <span className="person-card__tag-label">Цікавиться:</span>
                {renderTags(interests, 'tag--interest')}
            </div>

            <div className="person-card__footer">
                <button
                    className="btn btn-outline btn-sm"
                    onClick={e => { e.stopPropagation(); navigate(`/users/${id}`); }}
                >
                    Контакт
                </button>
            </div>
        </div>
    );
}

export type { PersonCardProps };
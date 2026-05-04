import { useNavigate } from 'react-router-dom';
import './ProfileSidebar.css';

interface Community {
    id: string;
    name: string;
    rating: number;
    membersCount: number;
}

interface Team {
    id: string;
    name: string;
    rating: number;
    membersCount: number;
}

interface ProfileSidebarProps {
    name: string;
    username: string;
    avatarUrl: string;
    rating: number;
    socials: { github?: string; linkedin?: string; facebook?: string };
    stats: {
        totalDone: number;
        tasksDone: number;
        knowledgeDone: number;
        tasksRating: number;
        knowledgeRating: number;
    };
    directions: string[];
    communities: Community[];
    teams: Team[];
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=128`;

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
);

export default function ProfileSidebar({
    name, username, avatarUrl, rating, socials,
    stats, directions, communities, teams,
}: ProfileSidebarProps) {
    const navigate = useNavigate();

    return (
        <aside className="profile-sidebar">
            {/* Identity */}
            <div className="sidebar-block sidebar-profile-block">
                <img src={getAvatar(avatarUrl, name)} alt={name} className="sidebar-avatar" />
                <div>
                    <div className="sidebar-name-row">
                        <span className="sidebar-name">{name}</span>
                        <span className="sidebar-rating">★{rating}</span>
                    </div>
                    <p className="sidebar-username">@{username}</p>
                </div>
                <div className="sidebar-socials">
                    {socials.github && (
                        <a href={socials.github} target="_blank" rel="noreferrer" className="social-link">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                        </a>
                    )}
                    {socials.linkedin && (
                        <a href={socials.linkedin} target="_blank" rel="noreferrer" className="social-link">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                        </a>
                    )}
                    {socials.facebook && (
                        <a href={socials.facebook} target="_blank" rel="noreferrer" className="social-link">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                        </a>
                    )}
                </div>
                <button className="btn-edit" onClick={() => navigate('/settings/profile')}>Редагувати</button>
            </div>

            {/* Stats */}
            <div className="sidebar-block">
                <p className="sidebar-block-title">Виконав всього: <strong>{stats.totalDone}</strong></p>
                <div className="stats-grid">
                    <div className="stat-cell">
                        <span className="stat-val">{stats.tasksDone}</span>
                        <span className="stat-lbl">Завдань</span>
                        <span className="stat-rat">★{stats.tasksRating}</span>
                    </div>
                    <div className="stat-cell">
                        <span className="stat-val">{stats.knowledgeDone}</span>
                        <span className="stat-lbl">Знань</span>
                        <span className="stat-rat">★{stats.knowledgeRating}</span>
                    </div>
                </div>
            </div>

            {/* Directions */}
            <div className="sidebar-block">
                <span className="section-label">Напрями:</span>
                <div className="tags">
                    {directions.map(dir => <span key={dir} className="tag">{dir}</span>)}
                </div>
            </div>

            {/* Communities */}
            <div className="sidebar-block">
                <span className="section-label">Спільноти:</span>
                {communities.length === 0 ? (
                    <span className="sidebar-empty">немає спільнот</span>
                ) : communities.map(c => (
                    <div key={c.id} className="community-row">
                        <div className="avatar"><UserIcon /></div>
                        <div>
                            <p className="community-name">{c.name} (★{c.rating})</p>
                            <p className="community-count">{c.membersCount} учасників</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teams */}
            <div className="sidebar-block">
                <span className="section-label">Команди:</span>
                {teams.length === 0 ? (
                    <span className="sidebar-empty">немає команд</span>
                ) : teams.map(t => (
                    <div key={t.id} className="community-row">
                        <div className="avatar"><UserIcon /></div>
                        <div>
                            <p className="community-name">{t.name} (★{t.rating})</p>
                            <p className="community-count">{t.membersCount} учасників</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}

export type { ProfileSidebarProps };
import { useNavigate } from 'react-router-dom';
import api from '../../../../api';
import './ProfileSidebar.css';

export interface ProfileSidebarProps {
    // Old props (for backward compatibility)
    name?: string;
    username?: string;
    rating?: number;
    socials?: { github?: string; linkedin?: string; facebook?: string };
    directions?: string[];
    teams?: any[];

    // New aligned props
    id?: number;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    nickname?: string;
    avatarUrl?: string;
    coverImageUrl?: string | null;
    bio?: string | null;
    status?: string;
    location?: {
        country: string | null;
        city: string | null;
    };
    socialLinks?: { platform: string; url: string }[];
    tags?: {
        skills: string[];
        interests: string[];
    };
    categories?: { id: number; name: string }[];
    stats?: {
        rating?: number;
        level?: number;
        xpProgress?: number;
        reputation?: number;
        completedTaskPoints?: number;
        // Old stats fallback
        totalDone?: number;
        tasksDone?: number;
        knowledgeDone?: number;
        tasksRating?: number;
        knowledgeRating?: number;
    };
    badges?: { name: string; iconUrl: string; description: string | null }[];
    communities?: {
        name: string;
        slug?: string;
        avatarUrl?: string | null;
        // Old mock fallbacks
        id?: string;
        rating?: number;
        membersCount?: number;
    }[];
    isPublic?: boolean;
}

const getAvatar = (url: string, name: string) =>
    url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&size=128`;

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
);

export default function ProfileSidebar(props: ProfileSidebarProps) {
    const {
        id, firstName, lastName, nickname, avatarUrl, bio,
        location, socialLinks, tags, categories, stats, badges, communities, isPublic,
        // Old props mapping fallback
        name: oldName,
        username: oldUsername,
        rating: oldRating,
        socials: oldSocials,
        directions: oldDirections,
    } = props;

    const navigate = useNavigate();

    // Map new vs old fields
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : (oldName || "Користувач");
    const displayUsername = nickname || oldUsername || "user";
    const displayRating = stats?.rating ?? oldRating ?? 0.0;

    const handleStartChat = async () => {
        if (!id) return;
        try {
            const { data } = await api.post(`/api/chats/direct/${id}`);
            navigate(`/chats`, { state: { selectedChatId: data.id } });
        } catch (err) {
            console.error("Failed to start chat:", err);
        }
    };

    return (
        <aside className="profile-sidebar">
            {/* Identity */}
            <div className="sidebar-block sidebar-profile-block">
                <img src={getAvatar(avatarUrl || "", displayName)} alt={displayName} className="sidebar-avatar" />
                <div>
                    <div className="sidebar-name-row">
                        <span className="sidebar-name">{displayName}</span>
                        <span className="sidebar-rating">★{displayRating.toFixed(1)}</span>
                    </div>
                    <p className="sidebar-username">@{displayUsername}</p>
                </div>
                
                {/* Social Links */}
                <div className="sidebar-socials">
                    {socialLinks && socialLinks.length > 0 ? (
                        socialLinks.map((sl) => {
                            const isGithub = sl.platform.toLowerCase().includes('github');
                            const isLinkedin = sl.platform.toLowerCase().includes('linkedin');
                            return (
                                <a key={sl.url} href={sl.url} target="_blank" rel="noreferrer" className="social-link">
                                    {isGithub && <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>}
                                    {isLinkedin && <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>}
                                    {!isGithub && !isLinkedin && <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>}
                                </a>
                            );
                        })
                    ) : (
                        <>
                            {oldSocials?.github && (
                                <a href={oldSocials.github} target="_blank" rel="noreferrer" className="social-link">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                </a>
                            )}
                            {oldSocials?.linkedin && (
                                <a href={oldSocials.linkedin} target="_blank" rel="noreferrer" className="social-link">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                                </a>
                            )}
                            {oldSocials?.facebook && (
                                <a href={oldSocials.facebook} target="_blank" rel="noreferrer" className="social-link">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                                </a>
                            )}
                        </>
                    )}
                </div>

                {isPublic ? (
                    <button className="btn-edit" onClick={handleStartChat} style={{ background: 'var(--purple)', color: '#fff' }}>Написати</button>
                ) : (
                    <button className="btn-edit" onClick={() => navigate('/settings/profile')}>Редагувати</button>
                )}
            </div>

            {bio && (
                <div className="sidebar-block">
                    <span className="section-label">Про себе:</span>
                    <p className="sidebar-bio" style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{bio}</p>
                </div>
            )}

            {(location?.city || location?.country) && (
                <div className="sidebar-block">
                    <span className="section-label">Локація:</span>
                    <p className="sidebar-location" style={{ fontSize: '14px', color: 'var(--text)' }}>
                        {location.city}{location.city && location.country ? ', ' : ''}{location.country}
                    </p>
                </div>
            )}

            {/* Stats */}
            {(stats || oldRating) && (
                <div className="sidebar-block">
                    {stats?.level ? (
                        <div className="stats-grid">
                            <div className="stat-cell">
                                <span className="stat-val">{stats.level}</span>
                                <span className="stat-lbl">Рівень</span>
                            </div>
                            <div className="stat-cell">
                                <span className="stat-val">{(stats.reputation ?? 0.0).toFixed(1)}</span>
                                <span className="stat-lbl">Репутація</span>
                            </div>
                            <div className="stat-cell">
                                <span className="stat-val">{stats.completedTaskPoints}</span>
                                <span className="stat-lbl">Бали</span>
                            </div>
                        </div>
                    ) : (
                        stats && (
                            <>
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
                            </>
                        )
                    )}
                </div>
            )}

            {/* Directions & Tags */}
            <div className="sidebar-block">
                <span className="section-label">Напрями:</span>
                <div className="tags">
                    {categories ? (
                        categories.length === 0 ? <span className="sidebar-empty">немає напрямів</span> : categories.map(cat => <span key={cat.id} className="tag">{cat.name}</span>)
                    ) : (
                        oldDirections?.map(dir => <span key={dir} className="tag">{dir}</span>)
                    )}
                </div>
                
                {tags?.skills && tags.skills.length > 0 && (
                    <>
                        <span className="section-label" style={{ marginTop: '16px', display: 'block' }}>Навички:</span>
                        <div className="tags">
                            {tags.skills.map(skill => <span key={skill} className="tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{skill}</span>)}
                        </div>
                    </>
                )}

                {tags?.interests && tags.interests.length > 0 && (
                    <>
                        <span className="section-label" style={{ marginTop: '16px', display: 'block' }}>Інтереси:</span>
                        <div className="tags">
                            {tags.interests.map(interest => <span key={interest} className="tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' }}>{interest}</span>)}
                        </div>
                    </>
                )}
            </div>

            {/* Communities */}
            <div className="sidebar-block">
                <span className="section-label">Спільноти:</span>
                {communities?.length === 0 ? (
                    <span className="sidebar-empty">немає спільнот</span>
                ) : communities?.map(c => (
                    <div key={c.slug} className="community-row">
                        <div className="avatar">
                            {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} width="100%" height="100%" style={{borderRadius: '4px'}} /> : <UserIcon />}
                        </div>
                        <div>
                            <p className="community-name">{c.name}</p>
                        </div>
                    </div>
                )) || (
                    <span className="sidebar-empty">немає спільнот</span>
                )}
            </div>

            {/* Badges */}
            <div className="sidebar-block">
                <span className="section-label">Досягнення:</span>
                {badges && badges.length > 0 ? (
                    <div className="badges-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {badges.map(b => (
                            <img key={b.name} src={b.iconUrl} alt={b.name} title={b.description || b.name} width="40" height="40" style={{ borderRadius: '8px' }} />
                        ))}
                    </div>
                ) : (
                    <span className="sidebar-empty">немає досягнень</span>
                )}
            </div>
        </aside>
    );
}
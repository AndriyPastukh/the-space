import { useState, useEffect } from 'react';
import ProfileSidebar from './components/ProfileSidebar/ProfileSidebar';
import PortfolioSection from './components/PortfolioSection/PortfolioSection';
import { usersApi, type UserProfile } from '../../features/users/usersApi';
import './MyProfilePage.css';

export default function MyProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const data = await usersApi.getMe();
                // Map backend data to ProfileSidebar expected format
                const mappedUser = {
                    name: `${data.firstName} ${data.lastName}`,
                    username: data.nickname,
                    avatarUrl: data.avatarUrl,
                    rating: data.stats?.rating || 0,
                    socials: data.socialLinks?.reduce((acc: any, link: any) => {
                        acc[link.platform.toLowerCase()] = link.url;
                        return acc;
                    }, {}) || {},
                    stats: {
                        totalDone: data.stats?.completedTaskPoints || 0,
                        tasksDone: 0, // Backend might need more specific stats
                        knowledgeDone: 0,
                        tasksRating: data.stats?.rating || 0,
                        knowledgeRating: 0,
                    },
                    directions: data.skillTags || [],
                    communities: data.communities || [],
                    teams: [],
                };
                setUser(mappedUser);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, []);

    if (loading) return <div className="loading-screen">Завантаження...</div>;
    if (!user) return <div className="error-screen">Помилка завантаження профілю</div>;

    return (
        <div className="my-profile-page">
            <div className="my-profile-container">
                <div className="my-profile-layout">
                    <ProfileSidebar {...user} />
                    <PortfolioSection items={[]} /> {/* Portfolio items could be fetched too */}
                </div>
            </div>
        </div>
    );
}
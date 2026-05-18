import ProfileSidebar from './components/ProfileSidebar/ProfileSidebar';
import PortfolioSection from './components/PortfolioSection/PortfolioSection';
import './MyProfilePage.css';

import { useProfile } from '../../hooks/useProfile';

export default function MyProfilePage() {
    const { profile, isLoading, error } = useProfile();

    if (isLoading) {
        return <div className="my-profile-page"><p>Завантаження...</p></div>;
    }

    if (error || !profile) {
        return <div className="my-profile-page"><p>{error || "Профіль не знайдено"}</p></div>;
    }

    return (
        <div className="my-profile-page">
            <div className="my-profile-container">
                <div className="my-profile-layout">
                    <ProfileSidebar {...profile} />
                    <PortfolioSection items={profile.portfolio} />
                </div>
            </div>
        </div>
    );
}
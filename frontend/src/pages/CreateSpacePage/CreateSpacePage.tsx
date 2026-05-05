import { useState } from 'react';
import CommunityForm from './components/CommunityForm/CommunityForm';
import TeamForm from './components/TeamForm/TeamForm';
import type { CommunityFormState } from './components/CommunityForm/CommunityForm';
import type { TeamFormState } from './components/TeamForm/TeamForm';
import './CreateSpacePage.css';

type SpaceTab = 'community' | 'team';

const initialCommunityState: CommunityFormState = {
    name: '',
    directions: [],
    description: '',
    avatar: null,
};

const initialTeamState: TeamFormState = {
    name: '',
    directions: [],
    description: '',
    avatar: null,
};

export default function CreateSpacePage() {
    const [activeTab, setActiveTab] = useState<SpaceTab>('community');
    const [communityForm, setCommunityForm] = useState<CommunityFormState>(initialCommunityState);
    const [teamForm, setTeamForm] = useState<TeamFormState>(initialTeamState);

    return (
        <div className="form-page">
            <div className="form-container">

                {/* Page header */}
                <div className="create-space-header reveal">
                    <h1 className="form-title create-space-title">Створення простору</h1>
                    <p className="create-space-subtitle">
                        Оберіть тип простору, який хочете створити
                    </p>
                </div>

                {/* Toggle tabs */}
                <div className="space-tabs reveal" data-delay="1">
                    <button
                        type="button"
                        className={`space-tab-btn ${activeTab === 'community' ? 'space-tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('community')}
                    >
                        <span className="space-tab-btn__icon">
                            {/* Community icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </span>
                        спільноту
                    </button>
                    <button
                        type="button"
                        className={`space-tab-btn ${activeTab === 'team' ? 'space-tab-btn--active' : ''}`}
                        onClick={() => setActiveTab('team')}
                    >
                        <span className="space-tab-btn__icon">
                            {/* Team icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </span>
                        команду
                    </button>
                </div>

                {/* Forms — both rendered but only one visible to preserve state */}
                <div className={activeTab === 'community' ? '' : 'create-space-form--hidden'}>
                    <CommunityForm
                        formState={communityForm}
                        onChange={setCommunityForm}
                    />
                </div>

                <div className={activeTab === 'team' ? '' : 'create-space-form--hidden'}>
                    <TeamForm
                        formState={teamForm}
                        onChange={setTeamForm}
                    />
                </div>

            </div>
        </div>
    );
}
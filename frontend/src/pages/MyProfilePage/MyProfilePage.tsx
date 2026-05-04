import ProfileSidebar from './components/ProfileSidebar/ProfileSidebar';
import PortfolioSection from './components/PortfolioSection/PortfolioSection';
import './MyProfilePage.css';

const MOCK_USER = {
    name: 'Роман К. Д',
    username: 'roman_komarov',
    avatarUrl: '',
    rating: 4.8,
    socials: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        facebook: 'https://facebook.com',
    },
    stats: {
        totalDone: 5,
        tasksDone: 2,
        knowledgeDone: 3,
        tasksRating: 4.7,
        knowledgeRating: 4.9,
    },
    directions: ['web', 'mobile', 'gamedev', 'design', 'figma', 'html', 'css'],
    communities: [
        { id: '1', name: 'Дизайнери', rating: 4.8, membersCount: 1240 },
    ],
    teams: [],
};

const MOCK_PORTFOLIO = [
    {
        id: '1',
        type: 'TASK' as const,
        authorName: 'Іван І. М.',
        authorAvatarUrl: '',
        authorRating: 5,
        actionLabel: 'Виконав',
        categories: ['design', 'figma', 'html', 'css', 'react'],
        title: 'Створити навігаційну панель для сайту...',
        review: 'Тексттт! Крутий чувак! Ультра. Напишу комент для його просування! Дуже рекомендую його всім!',
        timeAgo: '3 год. тому',
    },
    {
        id: '2',
        type: 'KNOWLEDGE' as const,
        authorName: 'Артем І. М.',
        authorAvatarUrl: '',
        authorRating: 4.8,
        actionLabel: 'Навчив',
        categories: ['design', 'figma', 'html', 'css'],
        title: '',
        review: 'Тексттт! Крутий чувак! Ультра. Напишу комент для його просування! Дуже рекомендую його всім!',
        timeAgo: '3 год. тому',
    },
    {
        id: '3',
        type: 'TASK' as const,
        authorName: 'Іван І. М.',
        authorAvatarUrl: '',
        authorRating: 5,
        actionLabel: 'Виконав',
        categories: ['design', 'figma', 'html', 'css'],
        title: 'Ще інший таск тут його тайтл такий...',
        review: 'Тексттт! Крутий чувак! Ультра. Напишу комент для його просування! Дуже рекомендую його всім!',
        timeAgo: '3 год. тому',
    },
];

export default function MyProfilePage() {
    return (
        <div className="my-profile-page">
            <div className="my-profile-container">
                <div className="my-profile-layout">
                    <ProfileSidebar {...MOCK_USER} />
                    <PortfolioSection items={MOCK_PORTFOLIO} />
                </div>
            </div>
        </div>
    );
}
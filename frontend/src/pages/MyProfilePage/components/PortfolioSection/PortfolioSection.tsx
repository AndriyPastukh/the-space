import { useState, useMemo } from 'react';
import PortfolioCard from '../PortfolioCard/PortfolioCard';
import type { PortfolioCardProps } from '../PortfolioCard/PortfolioCard';
import './PortfolioSection.css';

type TabType = 'TASK' | 'KNOWLEDGE' | 'REVIEWED';
type SortType = 'rating_desc' | 'rating_asc';

interface PortfolioSectionProps {
    items: PortfolioCardProps[];
}

export default function PortfolioSection({ items }: PortfolioSectionProps) {
    const [activeTab, setActiveTab] = useState<TabType>('REVIEWED');
    const [sort, setSort] = useState<SortType>('rating_desc');
    const [sortOpen, setSortOpen] = useState(false);

    const taskCount = items.filter(i => i.type === 'TASK').length;
    const knowledgeCount = items.filter(i => i.type === 'KNOWLEDGE').length;
    const reviewedCount = items.filter(i => i.review).length;

    const filtered = useMemo(() => {
        let result = items;
        if (activeTab === 'TASK') result = items.filter(i => i.type === 'TASK');
        else if (activeTab === 'KNOWLEDGE') result = items.filter(i => i.type === 'KNOWLEDGE');
        else result = items.filter(i => i.review);

        return [...result].sort((a, b) =>
            sort === 'rating_desc'
                ? b.authorRating - a.authorRating
                : a.authorRating - b.authorRating
        );
    }, [items, activeTab, sort]);

    return (
        <div className="portfolio-section">
            <h2 className="portfolio-section-title">Портфоліо</h2>

            <div className="portfolio-tabs-row">
                <button className={`ptab ${activeTab === 'REVIEWED' ? 'ptab--active' : ''}`} onClick={() => setActiveTab('REVIEWED')}>
                    З відгуками ({reviewedCount})
                </button>
                <button className={`ptab ${activeTab === 'TASK' ? 'ptab--active' : ''}`} onClick={() => setActiveTab('TASK')}>
                    Завдання ({taskCount})
                </button>
                <button className={`ptab ${activeTab === 'KNOWLEDGE' ? 'ptab--active' : ''}`} onClick={() => setActiveTab('KNOWLEDGE')}>
                    Знання ({knowledgeCount})
                </button>

                <div className="portfolio-sort">
                    <button className="sort-btn" onClick={() => setSortOpen(prev => !prev)}>
                        Оцінка {sortOpen ? '▲' : '▼'}
                    </button>
                    {sortOpen && (
                        <div className="sort-dropdown">
                            <button
                                className={`sort-option ${sort === 'rating_desc' ? 'sort-option--active' : ''}`}
                                onClick={() => { setSort('rating_desc'); setSortOpen(false); }}
                            >
                                За зростанням оцінки
                            </button>
                            <button
                                className={`sort-option ${sort === 'rating_asc' ? 'sort-option--active' : ''}`}
                                onClick={() => { setSort('rating_asc'); setSortOpen(false); }}
                            >
                                За спаданням оцінки
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="portfolio-list">
                {filtered.length === 0 ? (
                    <div className="portfolio-empty">
                        <span className="portfolio-empty-icon">🗂️</span>
                        <p>Тут поки нічого немає</p>
                    </div>
                ) : (
                    filtered.map(item => <PortfolioCard key={item.id} {...item} />)
                )}
            </div>
        </div>
    );
}
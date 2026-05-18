import PortfolioCard from '../PortfolioCard/PortfolioCard';
import type { PortfolioCardProps } from '../PortfolioCard/PortfolioCard';
import './PortfolioSection.css';

interface PortfolioSectionProps {
    items: PortfolioCardProps[];
}

export default function PortfolioSection({ items }: PortfolioSectionProps) {
    return (
        <div className="portfolio-section">
            <h2 className="portfolio-section-title">Портфоліо</h2>

            <div className="portfolio-list">
                {items.length === 0 ? (
                    <div className="portfolio-empty">
                        <span className="portfolio-empty-icon">🗂️</span>
                        <p>Тут поки нічого немає</p>
                    </div>
                ) : (
                    items.map((item, idx) => <PortfolioCard key={idx} {...item} />)
                )}
            </div>
        </div>
    );
}
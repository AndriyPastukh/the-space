import './PortfolioCard.css';

interface PortfolioCardProps {
    title: string;
    description: string | null;
    link: string | null;
}

export default function PortfolioCard({
    title, description, link
}: PortfolioCardProps) {
    return (
        <div className="portfolio-card">
            <div className="pcard-action-row">
                {title && <span className="pcard-title">{title}</span>}
            </div>

            {description && <p className="pcard-review" style={{ marginTop: '12px' }}>{description}</p>}
            
            {link && (
                <a href={link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '12px', color: 'var(--purple)' }}>
                    {link}
                </a>
            )}
        </div>
    );
}



export type { PortfolioCardProps };
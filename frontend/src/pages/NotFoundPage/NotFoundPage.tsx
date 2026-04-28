import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-box">
                <span className="not-found-code">404</span>
                <p className="not-found-message">Не знайдено запитаного ресурсу!</p>
                <button className="not-found-btn" onClick={() => navigate('/')}>
                    Повернутись на головну
                </button>
            </div>
        </div>
    );
}
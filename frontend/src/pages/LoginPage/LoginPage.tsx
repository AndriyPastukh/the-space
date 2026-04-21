import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../RegisterPage/RegisterPage.css'; // той самий CSS

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        pass: '',
        rememberMe: false
    });

    const [error, setError] = useState('');

    const handleInputChange = (e: any) => {
        const { id, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setError('');

        // Проста валідація
        if (!form.email || !form.pass) {
            setError("Введіть пошту та пароль");
            return;
        }

        console.log('Спроба входу:', {
            email: form.email,
            remember: form.rememberMe
        });

        alert('Вхід успішний!');
        navigate('/'); // Перехід на головну
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h1 className="auth-title">Увійти</h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <button type="button" className="google-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Через Google
                    </button>

                    <div className="divider">або поштою</div>

                    <div className="form-group">
                        <label className="form-label">Пошта</label>
                        <input
                            className="form-input"
                            type="email"
                            id="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="form-label">Пароль</label>
                            <Link
                                to="/forgot"
                                style={{ fontSize: '12px', color: 'var(--purple-lt)', marginBottom: '6px' }}
                            >
                                Забули пароль?
                            </Link>
                        </div>
                        <input
                            className="form-input"
                            type="password"
                            id="pass"
                            value={form.pass}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p className="err-msg" style={{color: '#f87171', marginBottom: '10px'}}>{error}</p>}

                    <label className="form-checkbox">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={form.rememberMe}
                            onChange={handleInputChange}
                        />
                        <span>Запам'ятати мене</span>
                    </label>

                    <button type="submit" className="btn-primary">
                        Увійти
                    </button>
                </form>

                <div className="auth-footer">
                    Немає акаунту? — <Link to="/register">Створити</Link>
                </div>
            </div>
        </div>
    );
}
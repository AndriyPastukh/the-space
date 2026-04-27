import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import { useAuth } from '../../hooks/useAuth';

// Інтерфейс для чіткої типізації сфер інтересів
interface Interest {
  id: string;
  label: string;
}

const INTERESTS: Interest[] = [
  { id: 'web', label: 'web' },
  { id: 'mobile', label: 'mobile' },
  { id: 'gamedev', label: 'gamedev' },
  { id: 'ui/ux', label: 'ui/ux design' },
  { id: 'qa', label: 'QA/testing' },
  { id: 'ds', label: 'Data Science' },
  { id: 'backend', label: 'backend' },
  { id: 'devops', label: 'DevOps' }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    pib: '',
    nick: '',
    email: '',
    pass: '',
    pass2: '',
    terms: false
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Обробник змін в інпутах
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Перемикач вибору інтересів
  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Валідація обов'язкових полів
    if (!form.pib || !form.nick || !form.email || !form.pass) {
      setError("Заповніть всі обов'язкові поля");
      return;
    }

    if (form.pass !== form.pass2) {
      setError('Паролі не збігаються');
      return;
    }

    if (!form.terms) {
      setError('Прийміть умови платформи');
      return;
    }

    // Відправка даних на реєстрацію. Використовуємо @ts-ignore, якщо хук ще не оновлено
    // @ts-ignore
    const registerResult = await register({ 
        email: form.email, 
        password: form.pass,
        pib: form.pib,
        nickname: form.nick,
        interests: selectedInterests
    });

    if (registerResult.success) {
      navigate('/');
    } else {
      setError(registerResult.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Зареєструватись</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Кнопка Google */}
          <button type="button" className="google-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            За допомогою Google
          </button>

          <div className="divider">або</div>

          {/* Поля вводу */}
          <div className="form-group">
            <label className="form-label">ПІБ*</label>
            <input
              className="form-input"
              type="text"
              id="pib"
              value={form.pib}
              onChange={handleInputChange}
              placeholder="Прізвище Ім'я Побатькові"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Нікнейм*</label>
            <input
              className="form-input"
              type="text"
              id="nick"
              value={form.nick}
              onChange={handleInputChange}
              placeholder="example_nickname"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пошта*</label>
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
            <label className="form-label">Сфери інтересів</label>
            <div className="interests-wrap">
              {INTERESTS.map(item => (
                <span
                  key={item.id}
                  className={`interest-chip ${selectedInterests.includes(item.id) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(item.id)}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль*</label>
            <input
              className="form-input"
              type="password"
              id="pass"
              value={form.pass}
              onChange={handleInputChange}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Повторіть пароль*</label>
            <input
              className="form-input"
              type="password"
              id="pass2"
              value={form.pass2}
              onChange={handleInputChange}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="err-msg">{error}</p>}

          <label className="form-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={form.terms}
              onChange={handleInputChange}
            />
            <span>
              Я приймаю {' '}
              <Link to="/terms" className="terms-link" target="_blank">
                умови платформи
              </Link>
            </span>
          </label>

          <button type="submit" className="btn-primary">
            Зареєструватись
          </button>
        </form>

        <div className="auth-footer">
          Вже маю акаунт — <Link to="/login">Увійти</Link>
        </div>
      </div>
    </div>
  );
}
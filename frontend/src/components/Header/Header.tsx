import "./Header.css"
import "../../pages/MainPage/MainPage.css"
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export const Header = () => {
    
    const { isAuth, user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const ChevronIcon = () => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="14"
            height="14"
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );

    return (
        <>
            <nav className="navbar">
                <a href="/" className="navbar-logo">
                    the space
                </a>

                <div className="nav-links">
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Завдання <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <a href="/search" className="dropdown-item">
                                Знайти завдання
                            </a>
                            <a href="/create" className="dropdown-item">
                                Створити завдання
                            </a>
                        </div>
                    </div>
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Знання <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <a href="/search?type=knowledge" className="dropdown-item">
                                Знайти знання
                            </a>
                            <a href="/create?type=knowledge" className="dropdown-item">
                                Запропонувати обмін
                            </a>
                        </div>
                    </div>
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Простір <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <a href="/space" className="dropdown-item">
                                Люди
                            </a>
                            <a href="/space?tab=community" className="dropdown-item">
                                Спільноти
                            </a>
                            <a href="/space?tab=team" className="dropdown-item">
                                Команди
                            </a>
                        </div>
                    </div>
                </div>

                <div className="nav-auth">
                    {isAuth ? (
                        <div className="nav-dropdown profile-dropdown">
                            <button className="nav-link profile-btn">
                                <div className="profile-avatar">ІП</div>
                                <span>{user.email}</span>
                            </button>
                            <div className="dropdown-menu">
                                <a href="/profile" className="dropdown-item">
                                    Мій кабінет
                                </a>
                                <div className="dropdown-divider"></div>
                                <button
                                    onClick={() => logout()}
                                    className="dropdown-item danger"
                                >
                                    Вийти
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <a href="/login" className="btn btn-ghost">
                                Увійти
                            </a>
                            <a href="/register" className="btn btn-primary">
                                Реєстрація
                            </a>
                        </>
                    )}
                </div>

                <button
                    className={`nav-hamburger ${isMobileMenuOpen ? "open" : ""}`}
                    aria-label="Меню"
                    onClick={toggleMobileMenu}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>

            {/* Мобільне меню */}
            <div className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}>
                <div className="mobile-nav-group-label">Навігація</div>
                <a href="/search" className="mobile-nav-link">
                    Завдання
                </a>
                <a href="/search?type=knowledge" className="mobile-nav-link">
                    Знання
                </a>
                <a href="/space" className="mobile-nav-link">
                    Простір
                </a>

                <div className="mobile-nav-divider"></div>

                <div className="mobile-nav-auth">
                    {isAuth ? (
                        <>
                            <a href="/profile" className="mobile-nav-link">
                                Мій кабінет
                            </a>
                            <button
                                onClick={() => logout()}
                                className="mobile-nav-link danger"
                                style={{
                                    background: "none",
                                    border: "none",
                                    width: "100%",
                                    textAlign: "left",
                                }}
                            >
                                Вийти
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="mobile-nav-link">
                                Увійти
                            </a>
                            <a href="/register" className="btn btn-primary btn-block">
                                Реєстрація
                            </a>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

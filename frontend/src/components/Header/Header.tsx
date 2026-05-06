import "./Header.css"
import "../../pages/MainPage/MainPage.css"
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

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
                <Link to="/" className="navbar-logo">
                    the space
                </Link>

                <div className="nav-links">
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Завдання <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <Link to="/search" className="dropdown-item">
                                Знайти завдання
                            </Link>
                            <Link to="/create-experience?type=task" className="dropdown-item">
                                Створити завдання
                            </Link>
                        </div>
                    </div>
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Знання <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <Link to="/search?type=knowledge" className="dropdown-item">
                                Знайти знання
                            </Link>
                            <Link to="/create-experience?type=knowledge" className="dropdown-item">
                                Запропонувати обмін
                            </Link>
                        </div>
                    </div>
                    <div className="nav-dropdown">
                        <span className="nav-link">
                            Простір <ChevronIcon />
                        </span>
                        <div className="dropdown-menu">
                            <Link to="/space" className="dropdown-item">
                                Люди
                            </Link>
                            <Link to="/space?tab=community" className="dropdown-item">
                                Спільноти
                            </Link>
                            <Link to="/space?tab=team" className="dropdown-item">
                                Команди
                            </Link>
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
                                <Link to="/profile" className="dropdown-item">
                                    Мій кабінет
                                </Link>
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
                            <Link to="/login" className="btn btn-ghost">
                                Увійти
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Реєстрація
                            </Link>
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
                <Link to="/search" className="mobile-nav-link">
                    Завдання
                </Link>
                <Link to="/search?type=knowledge" className="mobile-nav-link">
                    Знання
                </Link>
                <Link to="/space" className="mobile-nav-link">
                    Простір
                </Link>

                <div className="mobile-nav-divider"></div>

                <div className="mobile-nav-auth">
                    {isAuth ? (
                        <>
                            <Link to="/profile" className="mobile-nav-link">
                                Мій кабінет
                            </Link>
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
                            <Link to="/login" className="mobile-nav-link">
                                Увійти
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-block">
                                Реєстрація
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

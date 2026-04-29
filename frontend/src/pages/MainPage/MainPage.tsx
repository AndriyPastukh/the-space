import "./MainPage.css"

export function MainPage() {
    return (<><section className="hero">
        <div className="reveal">
            <h1 className="hero-title">
                TheSpace — простір досвіду, підтримки та перших кроків
            </h1>
        </div>
        <div className="reveal" data-delay="1">
            <p className="hero-subtitle">
                Виконуй невеликі практичні завдання-проєкти, створюй портфоліо та
                об'єднуйся з однодумцями для обміну знаннями і досвідом.
            </p>
        </div>
        <div className="reveal" data-delay="2">
            <div className="hero-search">
                <input
                    id="hero-search-input"
                    className="hero-search-input"
                    type="text"
                    placeholder="Знайди команду, завдання або людину..."
                />
                <button id="hero-search-btn" className="btn btn-primary">
                    Знайти
                </button>
            </div>
        </div>
    </section>

        <section className="steps-section">
            <div className="reveal">
                <p className="steps-label">Як розпочати?</p>
            </div>
            <div className="steps-grid">
                <div className="reveal">
                    <div className="step-card">
                        <p className="step-num">Крок 1</p>
                        <p className="step-text">Зареєструйся</p>
                    </div>
                </div>
                <div className="reveal" data-delay="1">
                    <div className="step-card">
                        <p className="step-num">Крок 2</p>
                        <p className="step-text">Знайди завдання</p>
                    </div>
                </div>
                <div className="reveal" data-delay="2">
                    <div className="step-card">
                        <p className="step-num">Крок 3</p>
                        <p className="step-text">Виконай та отримай досвід</p>
                    </div>
                </div>
            </div>
        </section>

        <div className="features">
            <div className="reveal">
                <div className="feature-row">
                    <div className="feature-mockup">
                        <div className="feature-mockup-header">
                            <span>the space</span>
                            <span>Завдання ↓</span>
                        </div>
                        <div className="feature-inner-card">
                            <div className="tags mb-10">
                                <span className="tag">design</span>
                                <span className="tag">figma</span>
                                <span className="tag tag-more">+3</span>
                            </div>
                            <p className="feature-card-title">
                                Створити навігаційну панель для сайту
                            </p>
                            <div className="feature-user-info">
                                <div className="avatar">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </div>
                                <span className="text-sm-muted">Орест (★ 4.2)</span>
                                <span className="badge badge-new">нове</span>
                            </div>
                            <div className="card-divider"></div>
                            <div className="feature-card-footer">
                                <span className="text-sm-muted">Відгукнулись: 10</span>
                                <button className="btn btn-primary">Відгукнутись</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="feature-eyebrow">Про розділ «Завдання»</p>
                        <h2 className="feature-title">
                            Виконуй практичні мініпроєкти для здобуття реального досвіду
                        </h2>
                        <p className="feature-desc">
                            Кожне успішне завдання автоматично поповнює твоє портфоліо.
                            Будуй репутацію через реальну роботу, а не просто резюме.
                        </p>
                        <a href="search.html" className="btn btn-outline">
                            Знайти завдання
                        </a>
                    </div>
                </div>
            </div>

            <div className="reveal">
                <div className="feature-row">
                    <div>
                        <p className="feature-eyebrow">Про розділ «Знання»</p>
                        <h2 className="feature-title">
                            Пропонуй навички в обмін на знання, яких тобі бракує
                        </h2>
                        <p className="feature-desc">
                            Вчися на практиці та допомагай вчитися іншим. Система обміну
                            досвідом об'єднує людей з різних напрямків.
                        </p>
                        <a href="search.html?type=knowledge" className="btn btn-outline">
                            Обмінятися досвідом
                        </a>
                    </div>
                    <div className="feature-mockup">
                        <div className="feature-inner-card">
                            <div className="knowledge-exchange">
                                <div className="knowledge-col">
                                    <p>Знаю:</p>
                                    <div className="tags">
                                        <span className="tag">figma</span>
                                        <span className="tag">design</span>
                                    </div>
                                </div>
                                <div className="knowledge-col">
                                    <p>Шукаю:</p>
                                    <div className="tags">
                                        <span className="tag">python</span>
                                        <span className="tag">api</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-divider"></div>
                            <div className="feature-user-info">
                                <div className="avatar">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </div>
                                <span className="text-sm-muted">Іван І. М. (★ 4.8)</span>
                                <span className="badge badge-new">нове</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reveal">
                <div className="feature-row">
                    <div className="feature-mockup">
                        <div className="feature-inner-card">
                            <div className="feature-community-header">
                                <div className="avatar avatar-lg">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="fw-600 fs-14">Спільнота Дизайнери (★ 4.8)</p>
                                    <p className="text-sm-muted">1,240 учасників</p>
                                </div>
                            </div>
                            <div className="tags">
                                <span className="tag">figma</span>
                                <span className="tag">ui/ux</span>
                                <span className="tag tag-more">+3</span>
                            </div>
                            <div className="card-divider"></div>
                            <button className="btn btn-primary btn-block btn-sm">
                                Надіслати заявку
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="feature-eyebrow">Про розділ «Простір»</p>
                        <h2 className="feature-title">
                            Знаходь однодумців та об'єднуйся в команди і спільноти
                        </h2>
                        <p className="feature-desc">
                            Розвивайся серед тих, хто теж починає свій шлях. Разом легше
                            вчитись, знаходити проєкти і рости.
                        </p>
                        <a href="space.html" className="btn btn-outline">
                            Знайти простір
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}


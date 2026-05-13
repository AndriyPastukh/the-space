import React, { useState } from 'react';
import './MyExperienceHistoryPage.css';

type TabType = 'Збережені' | 'Активні' | 'Виконані';
type CategoryType = 'Завдання' | 'Знання';

const MyExperienceHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Збережені');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Завдання');

  const hasData = true;

  return (
    <div className="history-page">
      <div className="history-container">
        <h1 className="page-title">Моя історія досвіду</h1>

        <header className="history-nav-wrapper">
          <div className="category-filters">
            <button 
              className={`nav-btn ${activeCategory === 'Завдання' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Завдання')}
            >
              Завдання
            </button>
            <button 
              className={`nav-btn ${activeCategory === 'Знання' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Знання')}
            >
              Знання
            </button>
          </div>

          <div className="status-tabs">
            {(['Збережені', 'Активні', 'Виконані'] as TabType[]).map((tab) => (
              <button
                key={tab}
                className={`tab-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="content-area">
          {!hasData ? (
            <div className="empty-state-box">
              <p>У вас ще немає ({activeTab.toLowerCase()}) ({activeCategory.toLowerCase()})!</p>
              <button className="action-main-btn">Знайти ({activeCategory.toLowerCase()})</button>
            </div>
          ) : (
            <div className="cards-stack">
              <div className="section-header">
                 <span className="current-status-tag">{activeTab}</span>
              </div>

              {activeCategory === 'Завдання' && (
                <div className="cards-grid">
                  {activeTab === 'Збережені' && (
                    <div className="exp-card">
                      <div className="card-top">
                        <div className="user-block">
                          <div className="avatar-small"></div>
                          <span className="user-name">Іван І. М.</span>
                        </div>
                        <div className="meta-block">
                          <span className="time">3 год. тому</span>
                          <button className="pin-btn">📌</button>
                        </div>
                      </div>
                      <div className="card-body">
                        <h3>Створити дизайн для сайту авто</h3>
                        <p className="card-desc">Опис завдання з макета...</p>
                        <div className="tags-row">
                          <span className="tag">design</span><span className="tag">figma</span>
                          <span className="tag">html</span><span className="tag">css</span>
                          <span className="tag-more">+ 3...</span>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="deadline">Дедлайн: 07.04.2026</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Активні' && (
                    <div className="exp-card active-card">
                      <div className="card-body">
                        <h3>Створити дизайн для сайту авто</h3>
                        <p className="card-desc">Робота в процесі...</p>
                        <div className="tags-row">
                           <span className="tag">design</span><span className="tag">figma</span>
                        </div>
                      </div>
                      <div className="active-footer">
                        <div className="user-info-row">
                          <div className="avatar-small"></div>
                          <span>Іван І. М.</span>
                          <span className="time">3 год. тому</span>
                        </div>
                        <div className="card-actions">
                          <button className="btn-secondary">Чат</button>
                          <button className="btn-primary">Надіслати</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Виконані' && (
                    <div className="exp-card review-card">
                      <div className="card-top">
                        <div className="user-block">
                          <div className="avatar-small"></div>
                          <span>Іван І. М. <span className="rating-star">★ 5</span></span>
                        </div>
                        <span className="time">3 год. тому</span>
                      </div>
                      <div className="review-content">
                        <p className="task-done"><strong>Виконав:</strong> Створити навігаційну панель...</p>
                        <p className="user-feedback">Крутий чувак! Ультра. Напишу комент для його просування!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeCategory === 'Знання' && (
                <div className="cards-grid">
                  <div className="exp-card knowledge-card">
                    <div className="card-top">
                      <div className="user-block">
                        <div className="avatar-small"></div>
                        <span className="user-name">Артем І. М.</span>
                      </div>
                      <div className="meta-block">
                        <span className="time">3 год. тому</span>
                        <button className="pin-btn">📌</button>
                      </div>
                    </div>
                    
                    <div className="knowledge-content">
                      <div className="knowledge-info-block">
                        <div className="info-row">
                          <span className="label">Знає:</span>
                          <div className="tags-row">
                            <span className="tag">design</span><span className="tag">figma</span><span className="tag-more">+3...</span>
                          </div>
                        </div>
                        <div className="info-row">
                          <span className="label">Шукає:</span>
                          <div className="tags-row">
                            <span className="tag">python</span><span className="tag">api</span><span className="tag-more">+2...</span>
                          </div>
                        </div>
                      </div>
                      <div className="knowledge-text-block">
                        <p>Можу навчити дизайну в Figma, а хочу навчитись python основам api. Допоможу з підбором кольорів та компонентів.</p>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="deadline">Дедлайн: 07.04.2026</span>
                      {activeTab === 'Активні' && (
                        <div className="card-actions">
                          <button className="btn-danger">Видалити</button>
                          <button className="btn-secondary">Редагувати</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyExperienceHistoryPage;
import React, { useState } from "react";
import "./TaskDetailsPage.css";

const TaskDetails: React.FC = () => {
  const [viewsCount, setViewsCount] = useState(15);
  const [responsesCount, setResponsesCount] = useState(5);
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = () => {
    if (!isApplied) {
      setResponsesCount((prev) => prev + 1);
      setIsApplied(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setViewsCount((prev) => prev + 1);
    alert("Посилання скопійовано!");
  };

  return (
    <div className="task-page-bg">
      <div className="task-wrapper">

        <div className="task-grid-layout">
          {/* ЛІВА ЧАСТИНА */}
          <div className="task-left-column">
            <div className="status-banner">
              Завдання вже виконане та є в архіві!
            </div>

            <div className="main-card">
              <div className="card-header-flex">
                <div className="title-area">
                  <h2 className="job-main-title">Створити навігаційну панель для сайту автомобілів</h2>
                  <div className="tags-row">
                    <span className="badge-new">нове</span>
                    <span className="text-muted">3 год. тому</span>
                  </div>
                </div>
                <div className="header-aside">
                  <span className="pin-icon">📌</span>
                  <p className="deadline-info">Дедлайн: <span>07.04.2026</span></p>
                </div>
              </div>

              <div className="task-description-body">
                <section className="info-block">
                  <h3>Опис:</h3>
                  <p>
                    Я хочу створити навігаційну панель для свого сайту продажу автомобілів щоб легко можна було 
                    переходити між сторінками, а також щоб дизайн був не простий, а схожий до тематики.
                  </p>
                </section>

                <section className="info-block">
                  <h3>Вкладені файли:</h3>
                  <p className="text-empty">Немає</p>
                </section>

                <section className="info-block">
                  <h3>Напрями:</h3>
                  <div className="skill-tags-group">
                    <span className="skill-tag">design</span>
                    <span className="skill-tag">figma</span>
                    <span className="skill-tag">html</span>
                  </div>
                </section>
              </div>
            </div>

            <div className="reviews-section">
              <h3 className="section-subtitle">Відгуки про замовника</h3>
              <div className="review-card">
                <div className="review-user-row">
                  <div className="user-avatar-info">
                    <div className="avatar-circle">👤</div>
                    <span className="user-full-name">Ігор П. М. ★ 5</span>
                  </div>
                  <span className="text-muted">3 год. тому</span>
                </div>
                <div className="review-task-line">
                  <p>Завдання: Ще інший таск тут його тайтл такий...</p>
                  <div className="mini-tags-list">
                    <span>design</span> <span>figma</span> <span>html</span> <span>+ 3...</span>
                  </div>
                </div>
                <p className="review-content-text">
                  Чудовий замовник! Дуже детально і чітко розписав що саме хотів отримати!
                </p>
              </div>
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА (Сайдбар) */}
          <aside className="task-right-sidebar">
            <div className="sidebar-sticky-card">
              <div className="action-buttons-stack">
                <button 
                  className={`btn-primary-action ${isApplied ? 'disabled' : ''}`} 
                  onClick={handleApply}
                  disabled={isApplied}
                >
                  {isApplied ? "Ви відгукнулись" : "Відгукнутись"}
                </button>
                <button className="btn-secondary-action" onClick={handleShare}>
                  Поділитись <span className="arrow-icon">↗</span>
                </button>
              </div>

              <div className="sidebar-line-divider"></div>

              <div className="sidebar-client-info">
                <p className="sidebar-small-label">Замовник:</p>
                <div className="client-flex">
                  <div className="avatar-circle-small">👤</div>
                  <div className="client-meta-data">
                    <p className="client-name-bold">Іван І. М.</p>
                    <p className="client-rating-stars">★ 5 <span>(10 відгук.)</span></p>
                  </div>
                </div>
              </div>

              <div className="sidebar-stats-list">
                <div className="stat-row-item">
                  <p className="sidebar-small-label">Переглянули:</p>
                  <p className="stat-number">{viewsCount} людей</p>
                </div>
                <div className="stat-row-item">
                  <p className="sidebar-small-label">Відгукнулись:</p>
                  <p className="stat-number">{responsesCount} людей</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
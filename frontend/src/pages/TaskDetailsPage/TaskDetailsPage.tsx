import React, { useState } from "react";
import "./TaskDetailsPage.css"; 

const taskData = {
  title: "Створити навігаційну панель для сайту автомобілів",
  description: "Я хочу створити навігаційну панель для свого сайту продажу автомобілів щоб легко можна було переходити між сторінками, а також щоб дизайн був не простий, а схожий до тематики.",
  deadline: "07.07.2026",
  categories: ["design", "figma", "html"],
  stats: { views: 15, responses: 5 },
  author: { name: "Іван І. М.", rating: 5, reviews: 10 }
};

const reviewsData = [
  {
    id: 1,
    author: "Ігор П. М.",
    rating: 5,
    text: "Чудовий замовник! Дуже детально і чітко розписав що саме хотів отримати!",
    taskTitle: "Тайтл завдання яке було виконане користувачем",
    tags: ["design", "figma", "html"]
  }
];

const TaskDetailsPage: React.FC = () => {
  const [isApplied, setIsApplied] = useState(false);
  const [responses, setResponses] = useState(taskData.stats.responses);

  const handleApply = () => {
    if (!isApplied) {
      setResponses(prev => prev + 1);
      setIsApplied(true);
    }
  };

  return (
    <div className="td-page-wrapper">
      <div className="td-container">

        <div className="td-layout">
          <div className="td-left">
            <div className="td-archive-banner">Завдання вже виконане та є в архіві!</div>

            <div className="td-card task-card">
              <div className="td-card-header">
                <div className="td-title-block">
                  <h2 className="td-job-title">{taskData.title}</h2>
                  <div className="td-meta">
                    <span className="td-badge-new">нове</span>
                    <span className="td-muted">3 год. тому</span>
                  </div>
                </div>
                <div className="td-header-right">
                  <span className="td-pin">📌</span>
                  <p className="td-deadline">Дедлайн: <span>{taskData.deadline}</span></p>
                </div>
              </div>

              <div className="td-content">
                <section>
                  <h3>Опис:</h3>
                  <p>{taskData.description}</p>
                </section>
                
                <section>
                  <h3>Вкладені файли:</h3>
                  <p className="td-muted">Немає</p>
                </section>

                <section>
                  <h3>Напрями:</h3>
                  <div className="td-tags-row">
                    {taskData.categories.map(cat => <span key={cat} className="td-tag">{cat}</span>)}
                  </div>
                </section>
              </div>
            </div>

            <div className="td-card td-add-review">
              <h3>Залишити відгук про замовника</h3>
              <textarea placeholder="Ваш відгук..." className="td-textarea"></textarea>
              <button className="td-btn-submit">Надіслати відгук</button>
            </div>

            <div className="td-reviews-list">
              <h3 className="td-section-title">Відгуки про замовника</h3>
              {reviewsData.map(rev => (
                <div key={rev.id} className="td-card td-review-item">
                  <div className="td-review-user">
                    <span className="td-user-info">👤 {rev.author} ★ {rev.rating}</span>
                    <span className="td-muted">3 год. тому</span>
                  </div>
                  <div className="td-review-task-meta">
                    <p>Завдання: {rev.taskTitle}</p>
                    <div className="td-mini-tags">
                      {rev.tags.map(t => <span key={t}>{t} </span>)} <span>+ 3...</span>
                    </div>
                  </div>
                  <p className="td-review-text">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="td-right">
            <div className="td-card td-sidebar">
              <div className="td-btn-group">
                <button 
                  className={`td-btn-apply ${isApplied ? 'applied' : ''}`} 
                  onClick={handleApply}
                  disabled={isApplied}
                >
                  {isApplied ? "Ви вже відгукнулись" : "Відгукнутись"}
                </button>
                <button className="td-btn-share">Поділитись ↗</button>
              </div>

              <div className="td-sidebar-divider"></div>

              <div className="td-owner-info">
                <p className="td-muted">Замовник:</p>
                <div className="td-owner-profile">
                  <div className="td-avatar-small">👤</div>
                  <div>
                    <p className="td-owner-name">{taskData.author.name}</p>
                    <p className="td-muted">★ {taskData.author.rating} ({taskData.author.reviews} відгук.)</p>
                  </div>
                </div>
              </div>

              <div className="td-stats-block">
                <div className="td-stat-item">
                  <p className="td-muted">Переглянули:</p>
                  <p className="td-stat-value">{taskData.stats.views} людей</p>
                </div>
                <div className="td-stat-item">
                  <p className="td-muted">Відгукнулись:</p>
                  <p className="td-stat-value">{responses} людей</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
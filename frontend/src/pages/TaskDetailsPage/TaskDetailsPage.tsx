import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./TaskDetailsPage.css";

const mockedData = {
  task: {
    id: "12",
    title: "Розробка мобільного додатку для доставки",
    description:
      "Потрібно розробити кросплатформний додаток на React Native. Основний функціонал: відстеження кур'єра, інтеграція з картою та платіжними системами.",
    status: "CLOSED",
    categories: [
      { id: 1, name: "Mobile Development" },
      { id: 5, name: "Design" },
    ],
    deadline: "2026-05-20T18:00:00Z",
    createdAt: "2026-04-26T11:50:00Z",
    urls: ["https://github.com/project-repo", "https://figma.com/design-file"],
    files: [
      {
        id: "file-1",
        name: "technical_requirements.pdf",
        url: "https://storage.provider.com/f1.pdf",
        sizeBytes: 2400000,
      },
    ],
    author: {
      id: "user-uuid",
      name: 'ТОВ "ТехноСвіт"',
      avatarUrl: "https://cdn.link/avatar.jpg",
      rating: 4.9,
      reviewsCount: 24,
    },
    statistics: {
      viewsCount: 142,
      proposalsCount: 12,
    },
    viewer: {
      isSaved: true,
      myProposalId: null,
    },
  },
};

const mockedComments = [
  {
    id: "review-1",
    message:
      "Чудовий замовник! Дуже детально і чітко розписав що саме хотів отримати!",
    createdAt: "2026-04-26T09:30:00Z",
    rating: 5,
    author: {
      id: "user-1",
      name: "Ігор П. М.",
      avatarUrl: "https://cdn.link/avatar1.jpg",
    },
    task: {
      id: "10",
      title: "Створення UI-кіта для фінтех-проєкту",
    },
  },
  {
    id: "review-2",
    message: "Оплата вчасно, ТЗ зрозуміле. Рекомендую.",
    createdAt: "2026-04-20T14:20:00Z",
    rating: 4,
    author: {
      id: "user-2",
      name: "Олена К.",
      avatarUrl: "https://cdn.link/avatar2.jpg",
    },
    task: {
      id: "8",
      title: "Редизайн головної сторінки",
    },
  },
];

// Helpers
const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
};

const getRelativeTime = (dateString: string) => {
  const diffInMs = new Date().getTime() - new Date(dateString).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  if (diffInHours < 1) return "менше години тому";
  if (diffInHours < 24) return `${diffInHours} год. тому`;
  return `${Math.floor(diffInHours / 24)} дн. тому`;
};

const TaskDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [taskDetails, setTaskDetails] = useState(mockedData.task);
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(mockedData.task.viewer.isSaved);

  useEffect(() => {
    // later: fetch task by id
    console.log("Task ID:", id);
    setTaskDetails(mockedData.task);
    setIsSaved(mockedData.task.viewer.isSaved);
  }, [id]);

  const handleApply = () => {
    if (!isApplied) setIsApplied(true);
  };

  const handleSaveToggle = () => {
    setIsSaved((prev) => !prev);
    // later: API call to save/unsave task
    console.log("Task saved status changed to:", !isSaved);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Посилання скопійовано!");
    } catch (err) {
      console.error("Помилка копіювання", err);
    }
  };

  const isFinished =
    taskDetails.status === "CLOSED" || taskDetails.status === "FINISHED";

  const truncateText = (text: string, limit: number) => {
    const words = text.split(" ");
    return words.length > limit
      ? words.slice(0, limit).join(" ") + "..."
      : text;
  };

  return (
    <div className="task-details-page">
      <div className="td-layout">
        {/* Left Panel */}
        <div className="td-main">
          {isFinished && (
            <div className="archive-banner">
              Завдання вже виконане та є в архіві!
            </div>
          )}

          <div className="card mb-24">
            <div className="td-header">
              <div className="td-title-block">
                <h2 className="td-title">
                  {truncateText(taskDetails.title, 100)}
                </h2>
                <div className="text-sm-muted">
                  {getRelativeTime(taskDetails.createdAt)}
                </div>
              </div>
              <div className="td-header-actions">
                <button
                  className={`btn ${isSaved ? "btn-saved" : "btn-outline"}`}
                  onClick={handleSaveToggle}
                >
                  {isSaved ? "📌 Збережено" : "📌 Зберегти"}
                </button>
                <p className="text-sm-muted mt-12 text-right">
                  Дедлайн:{" "}
                  <span className="fw-600 text-white">
                    {formatDate(taskDetails.deadline)}
                  </span>
                </p>
              </div>
            </div>

            <div className="card-divider mt-16 mb-24"></div>

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title">Опис</h3>
                <p className="td-text">
                  {truncateText(taskDetails.description, 300)}
                </p>
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Посилання</h3>
                {taskDetails.urls.length > 0 ? (
                  <ul className="td-list">
                    {taskDetails.urls.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm-muted">Немає</p>
                )}
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Вкладені файли</h3>
                {taskDetails.files.length > 0 ? (
                  <ul className="td-list">
                    {taskDetails.files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm-muted">Немає</p>
                )}
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Напрями</h3>
                <div className="tags">
                  {taskDetails.categories.map((cat) => (
                    <span key={cat.id} className="tag">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Bottom Panel — Reviews */}
          <h3 className="section-heading">Відгуки про замовника</h3>
          <div className="reviews-list mb-24">
            {mockedComments.map((review) => (
              <div key={review.id} className="card mb-16">
                <div className="review-header">
                  <img
                    src={review.author.avatarUrl}
                    alt={review.author.name}
                    className="avatar"
                  />
                  <div className="review-user-info">
                    <div className="fw-600 fs-14 text-white">
                      {review.author.name}
                    </div>
                    <div className="text-sm-muted mt-4">
                      Завдання: {review.task.title}
                    </div>
                  </div>
                  <div className="review-meta ml-auto text-right">
                    <div className="text-purple fw-600">
                      {"★".repeat(review.rating)}
                    </div>
                    <div className="text-sm-muted mt-4">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="card-divider mt-16 mb-16"></div>
                <p className="td-text fs-14">{review.message}</p>
              </div>
            ))}
          </div>

          <div className="card mb-24">
            <h3 className="td-section-title">Написати відгук</h3>
            <textarea
              placeholder="Ваш відгук..."
              className="form-input review-textarea mt-12"
            ></textarea>
            <button className="btn btn-primary mt-12">Надіслати</button>
          </div>
        </div>

        {/* Right Panel — Actions & Customer Info */}
        <aside className="td-sidebar-wrap">
          <div className="card td-sidebar">
            <div className="sidebar-actions">
              <button
                className={`btn btn-block ${isApplied || isFinished ? "btn-secondary" : "btn-primary"}`}
                onClick={handleApply}
                disabled={isApplied || isFinished}
              >
                {isApplied ? "Ви вже відгукнулись" : "Відгукнутись"}
              </button>
              <button
                className="btn btn-outline btn-block mt-12"
                onClick={handleShare}
              >
                Поділитись ↗
              </button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-owner">
              <div className="owner-card">
                <img
                  src={taskDetails.author.avatarUrl}
                  alt={taskDetails.author.name}
                  className="avatar avatar-lg"
                />
                <div className="owner-details">
                  <span className="owner-role text-sm-muted">Замовник</span>
                  <p className="fw-600 text-white">{taskDetails.author.name}</p>
                  <div className="owner-rating mt-4">
                    <span className="text-purple fw-600">
                      ★ {taskDetails.author.rating}
                    </span>
                    <span className="text-sm-muted ml-8">
                      ({taskDetails.author.reviewsCount} відгуків)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-stats">
              <h3 className="td-sidebar-heading mb-12">Статистика завдання</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-val">
                    {taskDetails.statistics.viewsCount}
                  </p>
                  <p className="text-sm-muted">Переглядів</p>
                </div>
                <div className="stat-box">
                  <p className="stat-val">
                    {taskDetails.statistics.proposalsCount +
                      (isApplied ? 1 : 0)}
                  </p>
                  <p className="text-sm-muted">Відгуків</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TaskDetailsPage;

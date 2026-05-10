import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useKnowledge } from "../../hooks/useKnowledge";
import "../../assets/styles/DetailsPage.css";

const comments = [
  {
    id: "review-1",
    message:
      "Чудовий замовник! Дуже детально і чітко розписав що саме хотів отримати!",
    createdAt: "2026-04-26T04:27:00Z",
    rating: 5,
    author: {
      id: "user-1",
      name: "Ігор П. М.",
      avatarUrl: "https://cdn.link/avatar1.jpg",
    },
    task: {
      id: "10",
      title: "Ще інший таск тут його тайтл такий...",
    },
  },
];

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";

  const d = new Date(dateString);

  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}.${d.getFullYear()}`;
};

const getRelativeTime = (dateString?: string) => {
  if (!dateString) return "";

  const diffInMs = new Date().getTime() - new Date(dateString).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) return "менше години тому";
  if (diffInHours < 24) return `${diffInHours} год. тому`;

  return `${Math.floor(diffInHours / 24)} дн. тому`;
};

const isRecentlyCreated = (dateString?: string) => {
  if (!dateString) return false;

  const diffInMs = new Date().getTime() - new Date(dateString).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  return diffInHours < 72;
};

const truncateText = (text = "", limit: number) => {
  const words = text.split(" ");

  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : text;
};

const KnowledgeDetailsPage: React.FC = () => {
  const { id } = useParams();

  const {
    knowledge: knowledgeDetails,
    isLoading,
    error,
  } = useKnowledge({
    id,
    enabled: Boolean(id),
  });

  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hadInitialProposal, setHadInitialProposal] = useState(false);

  useEffect(() => {
    if (!knowledgeDetails?.viewer) return;

    setIsSaved(knowledgeDetails.viewer.isSaved);
    setIsApplied(Boolean(knowledgeDetails.viewer.myProposalId));
    setHadInitialProposal(Boolean(knowledgeDetails.viewer.myProposalId));
  }, [knowledgeDetails]);

  const handleApply = () => {
    if (!isApplied) {
      setIsApplied(true);
    }
  };

  const handleSaveToggle = () => {
    setIsSaved((prev) => !prev);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Посилання скопійовано!");
    } catch (err) {
      console.error("Помилка копіювання", err);
    }
  };

  if (isLoading) {
    return (
      <div className="task-details-page">
        <div className="card">
          <p className="text-sm-muted">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-details-page">
        <div className="card">
          <p className="text-sm-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!knowledgeDetails) {
    return (
      <div className="task-details-page">
        <div className="card">
          <p className="text-sm-muted">Знання не знайдено</p>
        </div>
      </div>
    );
  }

  const isFinished =
    knowledgeDetails.status === "FINISHED" ||
    knowledgeDetails.status === "CLOSED";

  const isNew = isRecentlyCreated(knowledgeDetails.createdAt);

  const offerCategories = knowledgeDetails.offerCategories || [];
  const requestCategories = knowledgeDetails.requestCategories || [];

  const title = `${offerCategories
    .map((cat: { id: number; name: string }) => cat.name)
    .join(", ")} == ${requestCategories
    .map((cat: { id: number; name: string }) => cat.name)
    .join(", ")}`;

  return (
    <div className="task-details-page">
      <div className="td-layout">
        <div className="td-main">
          {isFinished && (
            <div className="archive-banner">
              Знання вже виконане та є в архіві!
            </div>
          )}

          <div className="card mb-24">
            <div className="td-header">
              <div className="td-title-block">
                <h2 className="td-title" style={{ textTransform: "capitalize" }}>
                  {title}
                </h2>

                <div
                  className="text-sm-muted mt-8"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  Опубліковано {getRelativeTime(knowledgeDetails.createdAt)}
                  {isNew && <span className="badge-new">нове</span>}
                </div>
              </div>

              <div className="td-header-actions">
                <button
                  type="button"
                  className={`btn ${isSaved ? "btn-saved" : "btn-outline"}`}
                  onClick={handleSaveToggle}
                >
                  {isSaved ? "📌 Збережено" : "📌 Зберегти"}
                </button>

                <p className="text-sm-muted mt-12 text-right">
                  Дедлайн:{" "}
                  <span className="fw-600 text-white">
                    {formatDate(knowledgeDetails.deadline)}
                  </span>
                </p>
              </div>
            </div>

            <div className="card-divider mt-16 mb-24" />

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title">Знаю</h3>

                {offerCategories.length > 0 ? (
                  <div className="tags mb-12">
                    {offerCategories.map((cat: { id: number; name: string }) => (
                      <span key={cat.id} className="tag">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm-muted mb-12">Категорії не вказані</p>
                )}

                <h4 className="fw-600 text-white mb-8">Що саме знаю:</h4>

                <p className="td-text mb-24">
                  {truncateText(knowledgeDetails.offerDescription, 300)}
                </p>
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Шукаю</h3>

                {requestCategories.length > 0 ? (
                  <div className="tags mb-12">
                    {requestCategories.map(
                      (cat: { id: number; name: string }) => (
                        <span
                          key={cat.id}
                          className="tag"
                          style={{
                            background: "rgba(192, 38, 211, 0.2)",
                            border: "1px solid rgba(192, 38, 211, 0.4)",
                          }}
                        >
                          {cat.name}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-sm-muted mb-12">Категорії не вказані</p>
                )}

                <h4 className="fw-600 text-white mb-8">Що саме шукаю:</h4>

                <p className="td-text mb-24">
                  {truncateText(knowledgeDetails.requestDescription, 300)}
                </p>
              </section>

              <div className="card-divider mt-16 mb-24" />

              <div
                className="stats-grid"
                style={{ gridTemplateColumns: "1fr 1fr", textAlign: "left" }}
              >
                <section className="td-section" style={{ marginTop: 0 }}>
                  <h3 className="td-section-title">Посилання</h3>

                  {knowledgeDetails.urls?.length > 0 ? (
                    <ul className="td-list">
                      {knowledgeDetails.urls.map((url: string, idx: number) => (
                        <li key={`${url}-${idx}`}>
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

                <section className="td-section" style={{ marginTop: 0 }}>
                  <h3 className="td-section-title">Вкладені файли</h3>

                  {knowledgeDetails.files?.length > 0 ? (
                    <ul className="td-list">
                      {knowledgeDetails.files.map((file: any, idx: number) => (
                        <li key={file.id ?? idx}>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name ?? file.url}
                              {file.sizeBytes
                                ? ` (${(file.sizeBytes / 1024 / 1024).toFixed(
                                    2,
                                  )} MB)`
                                : ""}
                            </a>
                          ) : (
                            <span>{file.name ?? String(file)}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm-muted">Немає</p>
                  )}
                </section>
              </div>
            </div>
          </div>

          <h3 className="section-heading">Відгуки про користувача</h3>

          <div className="reviews-list mb-24">
            {comments.map((review) => (
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

                <div className="card-divider mt-16 mb-16" />

                <p className="td-text fs-14">{review.message}</p>
              </div>
            ))}
          </div>

          <div className="card mb-24">
            <h3 className="td-section-title">Написати відгук</h3>

            <textarea
              placeholder="Ваш відгук..."
              className="form-input review-textarea mt-12"
            />

            <button type="button" className="btn btn-primary mt-12">
              Надіслати
            </button>
          </div>
        </div>

        <aside className="td-sidebar-wrap">
          <div className="card td-sidebar">
            <div className="sidebar-actions">
              <button
                type="button"
                className={`btn btn-block ${
                  isApplied || isFinished ? "btn-secondary" : "btn-primary"
                }`}
                onClick={handleApply}
                disabled={isApplied || isFinished}
              >
                {isApplied ? "Ви вже відгукнулись" : "Відгукнутись"}
              </button>

              <button
                type="button"
                className="btn btn-outline btn-block mt-12"
                onClick={handleShare}
              >
                Поділитись ↗
              </button>
            </div>

            <div className="card-divider my-24" />

            <div className="td-owner">
              <div className="owner-card">
                <img
                  src={knowledgeDetails.author.avatarUrl}
                  alt={knowledgeDetails.author.name}
                  className="avatar avatar-lg"
                />

                <div className="owner-details">
                  <span className="owner-role text-sm-muted">Користувач</span>

                  <p className="fw-600 text-white">
                    {knowledgeDetails.author.name}
                  </p>

                  <div className="owner-rating mt-4">
                    <span className="text-purple fw-600">
                      ★ {knowledgeDetails.author.rating}
                    </span>

                    <span className="text-sm-muted ml-8">
                      ({knowledgeDetails.author.reviewsCount} відгуків)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-divider my-24" />

            <div className="td-stats">
              <h3 className="td-sidebar-heading mb-12">
                Статистика пропозиції
              </h3>

              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-val">
                    {knowledgeDetails.statistics.viewsCount}
                  </p>
                  <p className="text-sm-muted">Переглянули</p>
                </div>

                <div className="stat-box">
                  <p className="stat-val">
                    {knowledgeDetails.statistics.proposalsCount +
                      (isApplied && !hadInitialProposal ? 1 : 0)}
                  </p>
                  <p className="text-sm-muted">Відгукнулись</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default KnowledgeDetailsPage;
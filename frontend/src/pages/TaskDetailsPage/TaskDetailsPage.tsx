import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { applyToTask, respondToProposal, completeTask, submitTaskReview } from "../../features/tasks/taskApi";
import { toggleSavedTask } from "../../features/tasks/savedTaskStorage";
import { useAuth } from "../../hooks/useAuth";
import { useTask } from "../../hooks/useTask";
import ApplicationRow from "../MyCreatedExperiencesPage/components/ApplicationRow/ApplicationRow";
import "../../assets/styles/DetailsPage.css";

interface TaskApplication {
    id: string;
    applicant: {
        id: number;
        firstName: string;
        lastName: string;
        avatarUrl: string;
        rating: number;
    };
    status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACCEPTED"
    | "SUBMITTED_FOR_REVIEW"
    | "COMPLETED";
    appliedAt: string;
}

interface TaskDetailsView {
    id: string;
    title?: string;
    description?: string;
    deadline?: string;
    createdAt: string;
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
    authorId: number;
    urls?: string[];
    files?: Array<{ id?: string; url?: string; name?: string }> | string[];
    categories?: Array<{ id: number; name: string }>;
    applications?: TaskApplication[];
    assignee?: {
        id: number;
        name: string;
        avatarUrl: string;
        rating: number;
        reviewsCount?: number;
    } | null;
    author: {
        name: string;
        avatarUrl: string;
        rating: number;
        reviewsCount: number;
    };
    statistics: {
        viewsCount: number;
        proposalsCount: number;
    };
    viewer?: {
        isSaved: boolean;
    };
    reviews?: Array<{
        id: number;
        rating: number;
        comment: string | null;
        createdAt: string;
        author: {
            firstName: string;
            lastName: string;
            nickname: string;
            avatarUrl: string;
        };
    }>;
}

const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}.${String(
        date.getMonth() + 1,
    ).padStart(2, "0")}.${date.getFullYear()}`;
};

const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";

    const diffInMs = new Date().getTime() - new Date(dateString).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "менше години тому";
    if (diffInHours < 24) return `${diffInHours} год. тому`;

    return `${Math.floor(diffInHours / 24)} дн. тому`;
};

const truncateText = (text: string, limit: number) => {
    if (!text) return "";

    const words = text.split(" ");
    return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : text;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data
            ?.message === "string"
    ) {
        return (error as { response: { data: { message: string } } }).response.data
            .message;
    }

    return fallbackMessage;
};

const TaskDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { task, isLoading, error, reload } = useTask({
        id,
        enabled: Boolean(id),
    });

    const taskDetails = task as TaskDetailsView | null;
    const [isApplied, setIsApplied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [isCompleting, setIsCompleting] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (!taskDetails) {
            return;
        }

        setIsSaved(taskDetails.viewer?.isSaved ?? false);

        if (!user || !taskDetails.applications) {
            setIsApplied(false);
            return;
        }

        setIsApplied(
            taskDetails.applications.some(
                (application) => application.applicant.id === Number(user.id),
            ),
        );
    }, [taskDetails, user]);

    const handleApply = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!id || isApplied) {
            return;
        }

        setIsSaving(true);

        try {
            await applyToTask(id);
            setIsApplied(true);
            reload();
        } catch (error) {
            console.error("Failed to apply:", error);
            alert(getErrorMessage(error, "Не вдалося відгукнутися на завдання"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAcceptProposal = async (applicationId: string) => {
        if (!id) return;
        if (
            !window.confirm(
                "Прийняти цю заявку? Інші заявки будуть автоматично відхилені.",
            )
        ) {
            return;
        }

        try {
            await respondToProposal(id, applicationId, "APPROVED");
            reload();
        } catch (error) {
            console.error("Failed to accept proposal:", error);
            alert(getErrorMessage(error, "Помилка при призначенні виконавця"));
        }
    };

    const handleRejectProposal = async (applicationId: string) => {
        if (!id) return;
        if (!window.confirm("Відхилити цю заявку?")) {
            return;
        }

        try {
            await respondToProposal(id, applicationId, "REJECTED");
            reload();
        } catch (error) {
            console.error("Failed to reject proposal:", error);
            alert(getErrorMessage(error, "Помилка при відхиленні заявки"));
        }
    };

    const handleStartChat = async (userId: number) => {
        try {
            const { data } = await api.post(`/api/chats/direct/${userId}`);
            navigate(`/chats`, { state: { selectedChatId: data.id } });
        } catch (error) {
            console.error("Failed to start chat:", error);
            alert(getErrorMessage(error, "Помилка при створенні чату"));
        }
    };

    const handleSaveToggle = () => {
        if (!id) {
            return;
        }

        setIsSaved(toggleSavedTask(id));
    };

    const handleCompleteTask = async () => {
        if (!id) return;
        if (!window.confirm("Ви впевнені, що хочете завершити це завдання? Після цього воно перейде в архів, а виконавцю буде створено запис у портфоліо.")) {
            return;
        }

        setIsCompleting(true);
        try {
            await completeTask(id);
            reload();
        } catch (error) {
            console.error("Failed to complete task:", error);
            alert(getErrorMessage(error, "Не вдалося завершити завдання"));
        } finally {
            setIsCompleting(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!id) return;
        setIsSubmittingReview(true);
        try {
            await submitTaskReview(id, reviewRating, reviewComment);
            setIsReviewModalOpen(false);
            setReviewComment("");
            setReviewRating(5);
            reload();
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert(getErrorMessage(error, "Не вдалося надіслати відгук"));
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Посилання скопійовано!");
        } catch (error) {
            console.error("Помилка копіювання", error);
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

    if (!taskDetails) {
        return (
            <div className="task-details-page">
                <div className="card">
                    <p className="text-sm-muted">Задачу не знайдено</p>
                </div>
            </div>
        );
    }

    const isOwner = user?.id ? Number(user.id) === taskDetails.authorId : false;
    const isUnavailableForApply =
        taskDetails.status !== "OPEN" || Boolean(taskDetails.assignee);

    const currentUserId = user?.id ? Number(user.id) : null;
    const isAssignee = taskDetails.assignee && taskDetails.assignee.id === currentUserId;
    const hasOtherAssignee = taskDetails.assignee && taskDetails.assignee.id !== currentUserId;

    let actionButtonText = "Відгукнутись";
    let isActionDisabled = isApplied || isUnavailableForApply || isSaving;

    if (isAssignee) {
        actionButtonText = "Ви виконуєте це завдання";
        isActionDisabled = true;
    } else if (isApplied) {
        actionButtonText = "Ви вже відгукнулися";
        isActionDisabled = true;
    } else if (hasOtherAssignee) {
        actionButtonText = "Виконавця вже обрано";
        isActionDisabled = true;
    } else if (isUnavailableForApply) {
        actionButtonText = "Набір виконавця завершено";
        isActionDisabled = true;
    } else if (isSaving) {
        actionButtonText = "Завантаження...";
        isActionDisabled = true;
    }

    return (
        <div className="task-details-page">
            <div className="td-layout">
                <div className="td-main">
                    {taskDetails.status === "COMPLETED" && (
                        <div className="archive-banner">
                            Завдання вже виконане та є в архіві!
                        </div>
                    )}

                    <div className="card mb-24">
                        <div className="td-header">
                            <div className="td-title-block">
                                <h2 className="td-title">
                                    {truncateText(taskDetails.title ?? "", 100)}
                                </h2>

                                <div className="text-sm-muted mt-8">
                                    {getRelativeTime(taskDetails.createdAt)}
                                </div>
                            </div>

                            <div className="td-header-actions">
                                {isOwner && taskDetails.status === "OPEN" && (
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ marginRight: "8px" }}
                                        onClick={() => navigate(`/tasks/${taskDetails.id}/edit`)}
                                    >
                                        ✏️ Редагувати
                                    </button>
                                )}

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
                                        {formatDate(taskDetails.deadline || "")}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="card-divider mt-16 mb-24" />

                        <div className="td-content">
                            <section className="td-section">
                                <h3 className="td-section-title">Опис</h3>
                                <p className="td-text">{taskDetails.description}</p>
                            </section>

                            {taskDetails.urls && taskDetails.urls.length > 0 && (
                                <section className="td-section">
                                    <h3 className="td-section-title">Посилання</h3>
                                    <ul className="td-list">
                                        {taskDetails.urls.map((url, index) => (
                                            <li key={`${url}-${index}`}>
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    {url}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {taskDetails.files && taskDetails.files.length > 0 && (
                                <section className="td-section">
                                    <h3 className="td-section-title">Вкладені файли</h3>
                                    <ul className="td-list">
                                        {taskDetails.files.map((file, index) => {
                                            if (typeof file === "string") {
                                                return <li key={`${file}-${index}`}>{file}</li>;
                                            }

                                            return (
                                                <li key={file.id ?? `${file.url ?? file.name}-${index}`}>
                                                    {file.url ? (
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {file.name ?? file.url}
                                                        </a>
                                                    ) : (
                                                        <span>{file.name ?? "Файл"}</span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            )}

                            <section className="td-section">
                                <h3 className="td-section-title">Напрями</h3>

                                {taskDetails.categories && taskDetails.categories.length > 0 ? (
                                    <div className="tags">
                                        {taskDetails.categories.map((category) => (
                                            <span key={category.id} className="tag">
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm-muted">Немає</p>
                                )}
                            </section>
                        </div>
                    </div>

                    {isOwner && taskDetails.status === "OPEN" && taskDetails.applications && taskDetails.applications.length > 0 && (
                        <div className="card mb-24">
                            <h3 className="td-section-title mb-16">
                                Заявки від виконавців ({taskDetails.applications.filter(app => app.status === 'PENDING').length})
                            </h3>
                            <div className="experience-card__applications">
                                {taskDetails.applications
                                    .filter((application) => application.status === "PENDING")
                                    .map((application) => (
                                        <ApplicationRow
                                            key={application.id}
                                            id={application.id}
                                            applicant={application.applicant}
                                            status={application.status}
                                            appliedAt={application.appliedAt}
                                            experienceStatus={taskDetails.status}
                                            onAccept={handleAcceptProposal}
                                            onReject={handleRejectProposal}
                                            onStartChat={handleStartChat}
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {taskDetails.status === "COMPLETED" && (
                        <div className="card mb-24">
                            <h3 className="td-section-title mb-16">Відгук виконавцю за роботу</h3>
                            {taskDetails.reviews && taskDetails.reviews.length > 0 ? (
                                <div className="review-display-card" style={{ background: 'var(--surface2)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <div className="review-display-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: '#f59e0b', fontSize: '20px', letterSpacing: '2px' }}>
                                                {'★'.repeat(taskDetails.reviews[0].rating)}{'☆'.repeat(5 - taskDetails.reviews[0].rating)}
                                            </span>
                                            <span className="text-white" style={{ fontWeight: 700, fontSize: '15px' }}>{taskDetails.reviews[0].rating} / 5</span>
                                        </div>
                                        <span className="text-sm-muted" style={{ fontSize: '13px' }}>{formatDate(taskDetails.reviews[0].createdAt)}</span>
                                    </div>
                                    {taskDetails.reviews[0].comment && (
                                        <p className="td-text mt-12" style={{ fontStyle: 'italic', background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--purple)', color: 'var(--text-muted)' }}>
                                            "{taskDetails.reviews[0].comment}"
                                        </p>
                                    )}
                                </div>
                            ) : (
                                isOwner ? (
                                    <div className="text-center py-16" style={{ background: 'var(--surface2)', padding: '24px', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                                        <p className="text-sm-muted mb-12">Ви ще не залишили відгук виконавцю за це завдання.</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => setIsReviewModalOpen(true)}
                                            type="button"
                                        >
                                            Залишити відгук
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm-muted">Відгуку про роботу ще не залишено замовником.</p>
                                )
                            )}
                        </div>
                    )}

                    <h3 className="section-heading">Відгуки про замовника</h3>
                    <div className="reviews-list mb-24">
                        <p className="text-sm-muted">Відгуків поки немає</p>
                    </div>
                </div>

                <aside className="td-sidebar-wrap">
                    <div className="card td-sidebar">
                        <div className="sidebar-actions">
                            {isOwner ? (
                                <>
                                    {taskDetails.status === "IN_PROGRESS" && (
                                        <button
                                            className="btn btn-primary btn-block mb-12"
                                            onClick={handleCompleteTask}
                                            disabled={isCompleting}
                                            type="button"
                                        >
                                            {isCompleting ? "Завершення..." : "Завершити завдання"}
                                        </button>
                                    )}

                                    {taskDetails.status === "COMPLETED" && (!taskDetails.reviews || taskDetails.reviews.length === 0) && (
                                        <button
                                            className="btn btn-primary btn-block mb-12"
                                            onClick={() => setIsReviewModalOpen(true)}
                                            type="button"
                                        >
                                            Залишити відгук
                                        </button>
                                    )}

                                    {taskDetails.status === "OPEN" && (
                                        <button
                                            className="btn btn-outline btn-block mb-12"
                                            onClick={() => navigate(`/tasks/${taskDetails.id}/edit`)}
                                            type="button"
                                        >
                                            ✏️ Редагувати
                                        </button>
                                    )}

                                    <button
                                        className="btn btn-outline btn-block mb-12"
                                        style={{
                                            color: "var(--error-color)",
                                            borderColor: "var(--error-color)",
                                            opacity: 0.7
                                        }}
                                        type="button"
                                        onClick={() => alert("Функція видалення на етапі розробки")}
                                    >
                                        Видалити
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className={`btn btn-block ${actionButtonText !== "Відгукнутись"
                                        ? "btn-secondary"
                                        : "btn-primary"
                                        }`}
                                    onClick={handleApply}
                                    disabled={isActionDisabled}
                                >
                                    {actionButtonText}
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-outline btn-block mt-12"
                                onClick={handleShare}
                            >
                                Поділитися ↗
                            </button>
                        </div>

                        <div className="card-divider my-24" />

                        <div className="td-owner">
                            <div className="owner-card">
                                <div className="avatar avatar-lg">
                                    {taskDetails.author.avatarUrl ? (
                                        <img src={taskDetails.author.avatarUrl} alt="" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {taskDetails.author.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

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

                        {taskDetails.assignee && (
                            <>
                                <div className="card-divider my-24" />

                                <div className="td-owner">
                                    <div className="owner-card">
                                        <div className="avatar avatar-lg">
                                            {taskDetails.assignee.avatarUrl ? (
                                                <img src={taskDetails.assignee.avatarUrl} alt="" />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {taskDetails.assignee.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="owner-details">
                                            <span className="owner-role text-sm-muted">Виконавець</span>
                                            <p className="fw-600 text-white">{taskDetails.assignee.name}</p>
                                            <div className="owner-rating mt-4">
                                                <span className="text-purple fw-600">
                                                    ★ {taskDetails.assignee.rating}
                                                </span>
                                            </div>
                                            {isOwner && taskDetails.assignee.id !== Number(user?.id) && (
                                                <button
                                                    className="btn btn-outline btn-xs mt-8"
                                                    onClick={() => handleStartChat(taskDetails.assignee!.id)}
                                                    type="button"
                                                    style={{ padding: "4px 10px", fontSize: "12px", width: "auto" }}
                                                >
                                                    Написати
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="card-divider my-24" />

                        <div className="td-stats">
                            <h3 className="td-sidebar-heading mb-12">Статистика завдання</h3>

                            <div className="stats-grid">
                                <div className="stat-box">
                                    <p className="stat-val">{taskDetails.statistics.viewsCount}</p>
                                    <p className="text-sm-muted">Переглядів</p>
                                </div>

                                <div className="stat-box">
                                    <p className="stat-val">
                                        {taskDetails.statistics.proposalsCount}
                                    </p>
                                    <p className="text-sm-muted">Відгуків</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Review Star Rating Modal */}
            {isReviewModalOpen && (
                <div className="review-modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="review-modal-content card" style={{
                        width: '450px',
                        maxWidth: '90%',
                        padding: '32px',
                        borderRadius: 'var(--radius)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <h3 className="td-title mb-16 text-white">Залишити відгук виконавцю</h3>
                        <p className="text-sm-muted mb-24">
                            Поділіться враженнями від співпраці з виконавцем <strong>{taskDetails.assignee?.name}</strong>. Ваш відгук буде відображатися в його профілі.
                        </p>

                        <div className="rating-selector mb-24" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span className="section-label">Оцінка роботи:</span>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '32px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        style={{
                                            cursor: 'pointer',
                                            color: star <= reviewRating ? '#f59e0b' : '#4b5563',
                                            transition: 'color 0.15s ease'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="fw-600 text-white mt-4">{reviewRating} з 5 зірок</span>
                        </div>

                        <div className="comment-field mb-24">
                            <label className="section-label mb-8" htmlFor="review-comment">Ваш коментар (необов'язково):</label>
                            <textarea
                                id="review-comment"
                                className="form-input"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Опишіть, як пройшла співпраця, чи задоволені ви якістю..."
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--surface2)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setIsReviewModalOpen(false)}
                                type="button"
                                disabled={isSubmittingReview}
                            >
                                Скасувати
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitReview}
                                type="button"
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? 'Надсилання...' : 'Надіслати відгук'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetailsPage;

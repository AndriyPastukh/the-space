import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { applyToTask, respondToProposal } from "../../features/tasks/taskApi";
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
                                    <button className="btn btn-outline btn-block mb-12" type="button">
                                        Редагувати
                                    </button>
                                    <button
                                        className="btn btn-outline btn-block mb-12"
                                        style={{
                                            color: "var(--error-color)",
                                            borderColor: "var(--error-color)",
                                        }}
                                        type="button"
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
        </div>
    );
};

export default TaskDetailsPage;

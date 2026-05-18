import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExperienceCard from "./components/ExperienceCard/ExperienceCard";
import type {
  ExperienceCardProps,
  ExperienceStatus,
} from "./components/ExperienceCard/ExperienceCard";
import { useAuth } from "../../hooks/useAuth";
import { useTasks } from "../../hooks/useTasks";
import { useKnowledges } from "../../hooks/useKnowledges";
import "./MyCreatedExperiencesPage.css";

type TypeTab = "CREATED" | "ASSIGNED";
type ContentTab = "TASK" | "KNOWLEDGE";
type StatusTabValue = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "SAVED" | "RESPONDED";

const CREATED_STATUS_TABS: Array<{ value: StatusTabValue; label: string }> = [
  { value: "OPEN", label: "Відкриті" },
  { value: "IN_PROGRESS", label: "В процесі" },
  { value: "COMPLETED", label: "Завершені" },
];

const ASSIGNED_STATUS_TABS: Array<{ value: StatusTabValue; label: string }> =
  [
    { value: "RESPONDED", label: "Відгукнулися" },
    { value: "IN_PROGRESS", label: "Активні" },
    { value: "COMPLETED", label: "Завершені" },
    { value: "SAVED", label: "Збережені" },
  ];

const EMPTY_ARRAY: number[] = [];

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

interface TaskItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  tags?: string[];
  categories?: Array<{ name: string }>;
  applications?: TaskApplication[];
  assignee?: {
    id: number;
    name: string;
    avatarUrl: string;
    rating: number;
  } | null;
  viewer?: {
    isSaved: boolean;
  };
}

const toExperienceStatus = (taskStatus: TaskItem["status"]): ExperienceStatus =>
  taskStatus === "IN_PROGRESS"
    ? "IN_PROGRESS"
    : taskStatus === "COMPLETED"
      ? "COMPLETED"
      : "OPEN";

export default function MyCreatedExperiencesPage() {
  const navigate = useNavigate();
  const { user, isAuthLoading } = useAuth();
  const [typeTab, setTypeTab] = useState<TypeTab>("CREATED");
  const [contentTab, setContentTab] = useState<ContentTab>("TASK");
  const [statusTab, setStatusTab] = useState<StatusTabValue>("OPEN");
  const [actionError, setActionError] = useState<string | null>(null);

  const isTaskEnabled = !!user && contentTab === "TASK";
  const isKnowledgeEnabled =
    !!user && contentTab === "KNOWLEDGE" && typeTab === "CREATED";
  const shouldLoadSavedTasks =
    typeTab === "ASSIGNED" && contentTab === "TASK" && statusTab === "SAVED";
  const shouldLoadRespondedTasks =
    typeTab === "ASSIGNED" && contentTab === "TASK" && statusTab === "RESPONDED";

  const tasks = useTasks({
    page: 1,
    limit: 100,
    search: "",
    categoryIds: EMPTY_ARRAY,
    authorId: typeTab === "CREATED" && user?.id ? Number(user.id) : undefined,
    assigneeId:
      typeTab === "ASSIGNED" && user?.id && !shouldLoadSavedTasks && !shouldLoadRespondedTasks
        ? Number(user.id)
        : undefined,
    respondedOnly: shouldLoadRespondedTasks,
    enabled: isTaskEnabled,
  });

  const knowledges = useKnowledges({
    page: 1,
    limit: 100,
    search: "",
    offerCategoryIds: EMPTY_ARRAY,
    requestCategoryIds: EMPTY_ARRAY,
    authorId: typeTab === "CREATED" && user?.id ? Number(user.id) : undefined,
    enabled: isKnowledgeEnabled,
  });

  const mappedTasks = useMemo<ExperienceCardProps[]>(() => {
    return (tasks.data as TaskItem[]).map((task) => ({
      type: "TASK",
      role: typeTab,
      id: String(task.id),
      title: task.title || "",
      description: task.description || "",
      tags:
        task.tags ||
        task.categories?.map((category: { name: string }) => category.name) ||
        [],
      createdAt: task.createdAt,
      status: toExperienceStatus(task.status),
      assignee: task.assignee || null,
      isSaved: Boolean(task.viewer?.isSaved),
      applications: (task.applications || []).map((app) => ({
        id: String(app.id),
        applicant: {
          id: Number(app.applicant.id || 0),
          firstName: app.applicant.firstName || "",
          lastName: app.applicant.lastName || "",
          avatarUrl: app.applicant.avatarUrl || "",
          rating: Number(app.applicant.rating || 0),
        },
        status: app.status,
        appliedAt: app.appliedAt || task.createdAt,
      })),
    }));
  }, [tasks.data, typeTab]);

  const mappedKnowledges = useMemo<ExperienceCardProps[]>(() => {
    return (knowledges.data || []).map((knowledge) => ({
      type: "KNOWLEDGE",
      id: String(knowledge.id),
      offer: {
        tags:
          knowledge.offer?.tags ||
          knowledge.offerCategories?.map((category: { name: string }) => category.name) ||
          [],
        description:
          knowledge.offerDescription || knowledge.offer?.description || "",
      },
      request: {
        tags:
          knowledge.want?.tags ||
          knowledge.requestCategories?.map((category: { name: string }) => category.name) ||
          [],
        description:
          knowledge.requestDescription || knowledge.want?.description || "",
      },
      createdAt: knowledge.createdAt,
    }));
  }, [knowledges.data]);

  const items = useMemo(() => {
    if (contentTab === "TASK") {
      return mappedTasks;
    }

    if (typeTab === "ASSIGNED") {
      return [];
    }

    return mappedKnowledges;
  }, [contentTab, mappedKnowledges, mappedTasks, typeTab]);

  const currentStatusTabs =
    typeTab === "ASSIGNED" ? ASSIGNED_STATUS_TABS : CREATED_STATUS_TABS;

  const isLoading = contentTab === "TASK" ? tasks.isLoading : knowledges.isLoading;
  const error =
    actionError ||
    (contentTab === "TASK"
      ? tasks.error
      : typeTab === "CREATED"
        ? knowledges.error
        : null);

  const countByStatus = (status: StatusTabValue) =>
    items.filter((item) => {
      if (item.type !== "TASK") {
        return false;
      }

      if (typeTab === "ASSIGNED" && status === "SAVED") {
        return item.isSaved;
      }

      if (typeTab === "ASSIGNED" && status === "RESPONDED") {
        const hasPendingProposal = item.applications.some(
          (app) => app.applicant.id === Number(user?.id) && app.status === "PENDING"
        );
        return item.status === "OPEN" && !item.assignee && hasPendingProposal;
      }

      if (typeTab === "ASSIGNED" && status === "IN_PROGRESS") {
        return item.assignee?.id === Number(user?.id) && item.status === "IN_PROGRESS";
      }

      if (typeTab === "ASSIGNED" && status === "COMPLETED") {
        return item.assignee?.id === Number(user?.id) && item.status === "COMPLETED";
      }

      return item.status === status;
    }).length;

  const filtered = useMemo(() => {
    if (contentTab === "KNOWLEDGE") {
      return items;
    }

    return items.filter((item) => {
      if (item.type !== "TASK") {
        return false;
      }

      if (typeTab === "ASSIGNED" && statusTab === "SAVED") {
        return item.isSaved;
      }

      if (typeTab === "ASSIGNED" && statusTab === "RESPONDED") {
        const hasPendingProposal = item.applications.some(
          (app) => app.applicant.id === Number(user?.id) && app.status === "PENDING"
        );
        return item.status === "OPEN" && !item.assignee && hasPendingProposal;
      }

      if (typeTab === "ASSIGNED" && statusTab === "IN_PROGRESS") {
        return item.assignee?.id === Number(user?.id) && item.status === "IN_PROGRESS";
      }

      if (typeTab === "ASSIGNED" && statusTab === "COMPLETED") {
        return item.assignee?.id === Number(user?.id) && item.status === "COMPLETED";
      }

      return item.status === statusTab;
    });
  }, [contentTab, items, statusTab, typeTab, user?.id]);

  const handleTaskChanged = () => {
    setActionError(null);
    tasks.reload();
  };

  const handleTaskActionError = (message: string) => {
    setActionError(message);
  };

  const resetStatusTab = (nextTypeTab: TypeTab, nextContentTab = contentTab) => {
    if (nextContentTab !== "TASK") {
      setStatusTab("OPEN");
      return;
    }

    setStatusTab(nextTypeTab === "ASSIGNED" ? "RESPONDED" : "OPEN");
  };

  if (isAuthLoading) {
    return (
      <div className="my-experiences-page">
        <div className="my-experiences-container">
          <div className="my-experiences-empty">
            <p>Завантаження профілю...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-experiences-page">
        <div className="my-experiences-container">
          <div className="my-experiences-empty">
            <span className="my-experiences-empty__icon">🔒</span>
            <p>Будь ласка, авторизуйтеся, щоб переглянути свої досвіди.</p>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Увійти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-experiences-page">
      <div className="my-experiences-container">
        <div className="my-experiences-header">
          <h1 className="my-experiences-title">Мої досвіди</h1>
          <button className="btn btn-primary" onClick={() => navigate("/create-experience")}>
            + Створити досвід
          </button>
        </div>

        <div className="type-tabs" style={{ marginBottom: "10px" }}>
          <button
            className={`type-tab ${typeTab === "CREATED" ? "type-tab--active" : ""}`}
            onClick={() => {
              setTypeTab("CREATED");
              resetStatusTab("CREATED");
              setActionError(null);
            }}
          >
            Я замовник
          </button>
          <button
            className={`type-tab ${typeTab === "ASSIGNED" ? "type-tab--active" : ""}`}
            onClick={() => {
              setTypeTab("ASSIGNED");
              resetStatusTab("ASSIGNED");
              setActionError(null);
            }}
          >
            Я виконавець
          </button>
        </div>

        <div className="type-tabs">
          <button
            className={`type-tab ${contentTab === "TASK" ? "type-tab--active" : ""}`}
            onClick={() => {
              setContentTab("TASK");
              resetStatusTab(typeTab, "TASK");
              setActionError(null);
            }}
          >
            Завдання
          </button>
          <button
            className={`type-tab ${contentTab === "KNOWLEDGE" ? "type-tab--active" : ""}`}
            onClick={() => {
              setContentTab("KNOWLEDGE");
              resetStatusTab(typeTab, "KNOWLEDGE");
              setActionError(null);
            }}
          >
            Знання
          </button>
        </div>

        {contentTab === "TASK" && (
          <div className="status-tabs">
            {currentStatusTabs.map((statusOption) => (
              <button
                key={statusOption.value}
                className={`status-tab ${statusTab === statusOption.value ? "status-tab--active" : ""}`}
                onClick={() => {
                  setStatusTab(statusOption.value);
                  setActionError(null);
                }}
              >
                {statusOption.label}
                <span className="status-tab__count">
                  {countByStatus(statusOption.value)}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#f87171",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {isLoading ? (
          <div className="my-experiences-empty">
            <p>Завантаження досвідів...</p>
          </div>
        ) : typeTab === "ASSIGNED" && contentTab === "KNOWLEDGE" ? (
          <div className="my-experiences-empty">
            <span className="my-experiences-empty__icon">💡</span>
            <p>
              Роль виконавця для знань поки не підтримується на бекенді.
              <br />
              Тому тут зараз відображаються лише виконавські завдання.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="my-experiences-empty">
            {contentTab === "TASK" ? (
              typeTab === "CREATED" ? (
                <>
                  <span className="my-experiences-empty__icon">📋</span>
                  <p>У цій вкладці поки немає завдань.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/create-experience")}
                  >
                    Створити завдання
                  </button>
                </>
              ) : (
                <>
                  <span className="my-experiences-empty__icon">
                    {statusTab === "SAVED" ? "📌" : "🔧"}
                  </span>
                  <p>
                    {statusTab === "SAVED"
                      ? "У вас поки немає збережених завдань."
                      : "У цій вкладці поки немає виконавських завдань."}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/search-experience?type=task")}
                  >
                    Знайти завдання
                  </button>
                </>
              )
            ) : (
              <>
                <span className="my-experiences-empty__icon">💡</span>
                <p>Ви ще не поділилися своїми знаннями.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/create-experience")}
                >
                  Поділитися знаннями
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="my-experiences-list">
            {filtered.map((item) => (
              <ExperienceCard
                key={item.id}
                {...item}
                onTaskChanged={handleTaskChanged}
                onTaskActionError={handleTaskActionError}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

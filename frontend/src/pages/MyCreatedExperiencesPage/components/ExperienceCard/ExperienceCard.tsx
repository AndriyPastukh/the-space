import { Link, useNavigate } from "react-router-dom";
import api from "../../../../api";
import { deleteKnowledge } from "../../../../features/knowledges/knowledgeApi";
import { deleteTask, respondToProposal } from "../../../../features/tasks/taskApi";
import ApplicationRow from "../ApplicationRow/ApplicationRow";
import "./ExperienceCard.css";

type ExperienceStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "SAVED";
type ExperienceRole = "CREATED" | "ASSIGNED";

interface Application {
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
  rating?: number;
  message?: string;
}

interface TaskCardData {
  type: "TASK";
  role: ExperienceRole;
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  status: ExperienceStatus;
  assignee: {
    id: number;
    name: string;
    avatarUrl: string;
    rating: number;
  } | null;
  isSaved: boolean;
  applications: Application[];
}

interface KnowledgeCardData {
  type: "KNOWLEDGE";
  id: string;
  offer: { tags: string[]; description: string };
  request: { tags: string[]; description: string };
  createdAt: string;
}

type ExperienceCardProps = TaskCardData | KnowledgeCardData;

interface ExperienceCardCallbacks {
  onTaskChanged?: () => void;
  onTaskActionError?: (message: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) return "щойно";
  if (hours < 24) return `${hours} год. тому`;

  return `${Math.floor(hours / 24)} дн. тому`;
}

const MAX_TAGS = 3;

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return null;
  }

  const visible = tags.slice(0, MAX_TAGS);
  const hidden = tags.length - MAX_TAGS;

  return (
    <div className="tags">
      {visible.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
      {hidden > 0 && <span className="tag tag-more">+{hidden}</span>}
    </div>
  );
}

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

export default function ExperienceCard(
  props: ExperienceCardProps & ExperienceCardCallbacks,
) {
  const navigate = useNavigate();

  const handleStartChat = async (userId: number) => {
    try {
      const { data } = await api.post(`/api/chats/direct/${userId}`);
      navigate(`/chats`, { state: { selectedChatId: data.id } });
    } catch (error) {
      console.error("Failed to start chat:", error);
      props.onTaskActionError?.(
        getErrorMessage(error, "Помилка при створенні чату"),
      );
    }
  };

  const visibleApplications =
    props.type === "TASK"
      ? props.status === "OPEN"
        ? props.applications
        : props.applications.filter(
            (application) =>
              application.status === "APPROVED" ||
              application.status === "ACCEPTED",
          )
      : [];

  const handleAccept = async (applicationId: string) => {
    if (
      !window.confirm(
        "Прийняти цю заявку? Інші заявки будуть автоматично відхилені.",
      )
    ) {
      return;
    }

    try {
      await respondToProposal(props.id, applicationId, "APPROVED");
      props.onTaskChanged?.();
    } catch (error) {
      console.error("Failed to accept proposal:", error);
      props.onTaskActionError?.(
        getErrorMessage(error, "Помилка при призначенні виконавця"),
      );
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!window.confirm("Відхилити цю заявку?")) {
      return;
    }

    try {
      await respondToProposal(props.id, applicationId, "REJECTED");
      props.onTaskChanged?.();
    } catch (error) {
      console.error("Failed to reject proposal:", error);
      props.onTaskActionError?.(
        getErrorMessage(error, "Помилка при відхиленні заявки"),
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей запис?")) {
      return;
    }

    try {
      if (props.type === "TASK") {
        await deleteTask(props.id);
      } else {
        await deleteKnowledge(props.id);
      }

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete experience:", error);
      props.onTaskActionError?.(
        getErrorMessage(error, "Помилка при видаленні запису"),
      );
    }
  };

  return (
    <div className="experience-card card">
      <div className="experience-card__header">
        <div className="experience-card__meta">
          <span
            className={`experience-card__type-badge ${
              props.type === "TASK" ? "badge--task" : "badge--knowledge"
            }`}
          >
            {props.type === "TASK" ? "Завдання" : "Знання"}
          </span>
          <span className="experience-card__time">{timeAgo(props.createdAt)}</span>
        </div>
        <div className="experience-card__actions">
          {(props.type !== "TASK" || props.status === "OPEN") && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (props.type === "TASK") {
                  navigate(`/tasks/${props.id}/edit`);
                } else {
                  navigate(`/knowledges/${props.id}/edit`);
                }
              }}
              type="button"
            >
              Редагувати
            </button>
          )}
          <button
            className="btn btn-outline btn-sm experience-card__btn--delete"
            onClick={handleDelete}
            type="button"
          >
            Видалити
          </button>
        </div>
      </div>

      {props.type === "TASK" && (
        <div className="experience-card__body">
          <h3 className="experience-card__title">
            <Link to={`/tasks/${props.id}`} className="experience-card__link">
              {props.title}
            </Link>
          </h3>
          <p className="experience-card__desc">{props.description}</p>
          <TagList tags={props.tags} />
          {props.assignee && props.status !== "OPEN" && (
            <div className="experience-card__executor-info" style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <p className="text-sm-muted" style={{ margin: 0 }}>
                Виконавець: <span className="fw-600 text-white">{props.assignee.name}</span>
              </p>
              <button
                className="btn btn-outline btn-xs"
                onClick={() => handleStartChat(props.assignee!.id)}
                type="button"
                style={{ padding: "2px 8px", fontSize: "12px" }}
              >
                Написати
              </button>
            </div>
          )}
        </div>
      )}

      {props.type === "KNOWLEDGE" && (
        <div className="experience-card__body">
          <h3 className="experience-card__title" style={{ marginBottom: "10px" }}>
            <Link to={`/knowledges/${props.id}`} className="experience-card__link">
              Обмін знаннями #{props.id.slice(0, 8)}
            </Link>
          </h3>
          <div className="knowledge-blocks">
            <div className="knowledge-block knowledge-block--offer">
              <span className="knowledge-block__label">Знає:</span>
              <TagList tags={props.offer.tags} />
              <p className="knowledge-block__desc">{props.offer.description}</p>
            </div>
            <div className="knowledge-block knowledge-block--request">
              <span className="knowledge-block__label">Шукає:</span>
              <TagList tags={props.request.tags} />
              <p className="knowledge-block__desc">{props.request.description}</p>
            </div>
          </div>
        </div>
      )}

      {props.type === "TASK" &&
        props.role === "CREATED" &&
        visibleApplications.length > 0 && (
          <div className="experience-card__applications">
            <span className="experience-card__apps-label">
              Заявки ({visibleApplications.length})
            </span>
            {visibleApplications.map((application) => (
              <ApplicationRow
                key={application.id}
                {...application}
                experienceStatus={props.status}
                onAccept={handleAccept}
                onReject={handleReject}
                onStartChat={handleStartChat}
              />
            ))}
          </div>
        )}
    </div>
  );
}

export type { ExperienceCardProps, ExperienceStatus, ExperienceRole };

import "./ApplicationRow.css";

interface Applicant {
  id?: number;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  rating: number;
}

interface ApplicationRowProps {
  id: string;
  applicant: Applicant;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACCEPTED"
    | "SUBMITTED_FOR_REVIEW"
    | "COMPLETED";
  appliedAt: string;
  experienceStatus: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "SAVED";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onStartChat?: (userId: number) => void;
  message?: string;
}

const getAvatar = (url: string, name: string) =>
  url ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=7c3aed&color=fff&size=48`;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) return "щойно";
  if (hours < 24) return `${hours} год. тому`;

  return `${Math.floor(hours / 24)} дн. тому`;
}

export default function ApplicationRow({
  id,
  applicant,
  appliedAt,
  experienceStatus,
  onAccept,
  onReject,
  onStartChat,
  message,
}: ApplicationRowProps) {
  const name = `${applicant.firstName} ${applicant.lastName}`;

  return (
    <div className="app-row">
      <div className="app-row__left">
        <img
          src={getAvatar(applicant.avatarUrl, name)}
          alt={name}
          className="app-row__avatar"
        />
        <div className="app-row__info">
          <div className="app-row__identity">
            <span className="app-row__name">{name}</span>
            <span className="app-row__rating">★ {applicant.rating}</span>
          </div>
          {message && <p className="app-row__message">{message}</p>}
        </div>
      </div>

      <div className="app-row__actions">
        {onStartChat && applicant.id && (
          <button
            className="btn btn-outline btn-sm app-row__btn--chat"
            onClick={() => onStartChat(applicant.id!)}
            type="button"
          >
            Написати
          </button>
        )}
        {experienceStatus === "OPEN" && (
          <>
            <button
              className="btn btn-outline btn-sm app-row__btn--danger"
              onClick={() => onReject?.(id)}
              type="button"
            >
              Відхилити
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onAccept?.(id)}
              type="button"
            >
              Прийняти
            </button>
          </>
        )}
      </div>

      <span className="app-row__time">{timeAgo(appliedAt)}</span>
    </div>
  );
}

export type { ApplicationRowProps };

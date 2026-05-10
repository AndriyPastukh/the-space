import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { teamsApi } from "../../features/teams/teamsApi";
import type { Team } from "../../features/teams/teamsApi";
import "./TeamDetailsPage.css";

const TeamDetailsPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<string>('GUEST');

  useEffect(() => {
    if (slug) {
      const fetchTeam = async () => {
        setLoading(true);
        try {
          const data = await teamsApi.findOne(slug);
          setTeam(data);
          setJoinStatus(data.currentUserStatus);
        } catch (err) {
          console.error("Failed to fetch team:", err);
          setError("Команду не знайдено");
        } finally {
          setLoading(false);
        }
      };
      fetchTeam();
    }
  }, [slug]);

  const handleJoin = async () => {
    if (!team) return;
    try {
      await teamsApi.joinRequest(team.id);
      setJoinStatus('PENDING');
    } catch (err) {
      console.error("Failed to join team:", err);
    }
  };

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (error || !team) return <div className="error-screen">{error || "Помилка завантаження"}</div>;

  return (
    <div className="task-details-page">
      <div className="td-layout">
        <div className="td-main">
          <div className="card main-card">
            <div className="td-header">
              <div className="team-header-flex">
                <div className="team-avatar-square">
                  {team.avatarUrl ? (
                    <img src={team.avatarUrl} alt={team.name} />
                  ) : (
                    team.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="td-title">{team.name}</h2>
                  <div className="team-stats-row">
                    <span className="text-sm-muted">{team.memberCount} учасників</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-divider mt-16 mb-24"></div>

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title">Опис</h3>
                <p className="td-text">{team.description}</p>
              </section>

              {team.directions && team.directions.length > 0 && (
                <section className="td-section">
                  <h3 className="td-section-title">Напрямки</h3>
                  <div className="tags">
                    {team.directions.map(dir => (
                      <span key={dir.id} className="tag">{dir.name}</span>
                    ))}
                  </div>
                </section>
              )}

              <p className="text-sm-muted mt-auto pt-24 fs-12">
                Дата створення: {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <aside className="td-sidebar-wrap">
          <div className="card sidebar-card">
            <div className="sidebar-actions">
              {joinStatus === 'GUEST' ? (
                <button className="btn btn-primary btn-block" onClick={handleJoin}>Доєднатися</button>
              ) : (
                <button className="btn btn-secondary btn-block" disabled>
                  {joinStatus === 'PENDING' ? 'Запит надіслано' : 'Ви учасник'}
                </button>
              )}
              <button className="btn btn-outline btn-block mt-12">Поділитись ↗</button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-roster">
              <h3 className="td-sidebar-heading mb-12">Склад команди</h3>
              {team.members && team.members.length > 0 ? (
                <div className="roster-group mb-12">
                  {team.members.map(m => (
                    <div key={m.id} className="member-row">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} className="avatar avatar-sm" alt={m.name} />
                      ) : (
                        <div className="avatar-placeholder avatar-sm">{m.name.charAt(0)}</div>
                      )}
                      <span className="text-white fs-14">{m.name}</span>
                      <span className="role-badge">{m.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm-muted">Немає учасників</p>
              )}
            </div>

            <div className="card-divider mt-auto my-24"></div>

            <div className="td-stats">
              <h3 className="td-sidebar-heading mb-12">Статистика</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-val">{team.statistics.views}</p>
                  <p className="text-sm-muted">Переглядів</p>
                </div>
                <div className="stat-box">
                  <p className="stat-val">{team.statistics.requests}</p>
                  <p className="text-sm-muted">Заявок</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeamDetailsPage;

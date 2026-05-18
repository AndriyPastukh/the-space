import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../assets/styles/DetailsPage.css";
import { communitiesApi } from "../../features/communities/communitiesApi";
import type { Community } from "../../features/communities/communitiesApi";

const CommunityDetailsPage: React.FC = () => {
  const { id: slug } = useParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<string>('GUEST');

  useEffect(() => {
    if (slug) {
      const fetchCommunity = async () => {
        setLoading(true);
        try {
          const data = await communitiesApi.findOne(slug);
          setCommunity(data);
          setJoinStatus(data.currentUserStatus);
        } catch (err) {
          console.error("Failed to fetch community:", err);
          setError("Спільноту не знайдено");
        } finally {
          setLoading(false);
        }
      };
      fetchCommunity();
    }
  }, [slug]);

  const handleJoin = async () => {
    if (!community) return;
    try {
      await communitiesApi.joinRequest(community.id);
      setJoinStatus('PENDING');
    } catch (err) {
      console.error("Failed to join community:", err);
    }
  };

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (error || !community) return <div className="error-screen">{error || "Помилка завантаження"}</div>;

  return (
    <div className="task-details-page">
      <div className="td-layout">
        <div className="td-main">
          <div className="card mb-24">
            <div className="td-header">
              <div className="entity-header-flex">
                <div className="entity-avatar circle">
                  {community.avatarUrl ? (
                    <img src={community.avatarUrl} alt={community.name} />
                  ) : (
                    community.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="td-title">{community.name}</h2>
                  <div className="text-sm-muted mt-8">
                    {community.memberCount} учасників
                  </div>
                </div>
              </div>
            </div>

            <div className="card-divider mt-16 mb-24"></div>

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title">Про спільноту</h3>
                <p className="td-text">{community.description}</p>
              </section>

              {community.directions && community.directions.length > 0 && (
                <section className="td-section">
                  <h3 className="td-section-title">Теми</h3>
                  <div className="tags">
                    {community.directions.map(dir => (
                      <span key={dir.id} className="tag">#{dir.name}</span>
                    ))}
                  </div>
                </section>
              )}

              <p className="text-sm-muted mt-auto pt-24 fs-12">
                Дата створення: {new Date(community.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <aside className="td-sidebar-wrap">
          <div className="card td-sidebar">
            <div className="sidebar-actions">
              {joinStatus === 'GUEST' ? (
                <button className="btn btn-primary btn-block" onClick={handleJoin}>
                  Доєднатися
                </button>
              ) : (
                <button className="btn btn-secondary btn-block" disabled>
                  {joinStatus === 'PENDING' ? 'Запит надіслано' : 'Ви учасник'}
                </button>
              )}
              <button className="btn btn-outline btn-block mt-12">Поділитись ↗</button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-roster">
              <h3 className="td-sidebar-heading mb-12">Учасники</h3>
              {community.members && community.members.length > 0 ? (
                <div className="roster-group mb-12">
                  {community.members.map(m => (
                    <div key={m.id} className="member-row">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} className="avatar avatar-sm" alt="" />
                      ) : (
                        <div className="avatar avatar-sm placeholder-avatar">{m.name.charAt(0).toUpperCase()}</div>
                      )}
                      <span className="text-white fs-14 fw-600">{m.name}</span>
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
                  <p className="stat-val">{community.statistics?.views || 0}</p>
                  <p className="text-sm-muted">Переглядів</p>
                </div>
                <div className="stat-box">
                  <p className="stat-val">{community.statistics?.posts || 0}</p>
                  <p className="text-sm-muted">Публікацій</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CommunityDetailsPage;

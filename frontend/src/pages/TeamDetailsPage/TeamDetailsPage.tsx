import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./TeamDetailsPage.css";

// Типізація
interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  role: 'Admin' | 'Helper' | 'Member';
}

const TeamDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [joinStatus, setJoinStatus] = useState<'guest' | 'pending' | 'member'>('guest');

  // Дані команди
  const team = {
    name: "Gamers",
    memberCount: 20,
    description: "Ми — команда ентузіастів, що розробляє кросплатформенні ігри на Unity. Шукаємо талановитих розробників та дизайнерів для нових проєктів. Наша мета — створювати унікальний ігровий досвід для мобільних платформ.",
    directions: ["gamedev", "unity", "c#", "3d дизайн"],
    createdAt: "12.05.2024",
    statistics: { views: 142, requests: 12 },
    links: [
      { label: "GitHub", url: "https://github.com" },
      { label: "Сайт", url: "https://google.com" }
    ]
  };

  const members: TeamMember[] = [
    { id: 1, name: "Ігор М.", avatar: "https://via.placeholder.com/40", role: 'Admin' },
    { id: 2, name: "Олена К.", avatar: "https://via.placeholder.com/40", role: 'Helper' },
    { id: 3, name: "Олександр Р.", avatar: "https://via.placeholder.com/40", role: 'Member' },
    { id: 4, name: "Дмитро Л.", avatar: "https://via.placeholder.com/40", role: 'Member' },
  ];

  const handleJoin = () => setJoinStatus('pending');

  return (
    <div className="task-details-page">
      <div className="td-layout">
        
        {/* ЛІВА ПАНЕЛЬ */}
        <div className="td-main">
          {/* Картка інформації */}
          <div className="card mb-24">
            <div className="td-header">
              <div className="td-title-block">
                <div className="team-header-flex">
                  <div className="team-avatar-square">G</div>
                  <div>
                    <h2 className="td-title">{team.name}</h2>
                    <div className="team-stats-row">
                      <span className="text-sm-muted">{team.memberCount} учасників</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="td-header-actions">
                <button className="btn btn-saved">📌 Зберегти</button>
              </div>
            </div>

            <div className="card-divider mt-16 mb-24"></div>

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title">Опис</h3>
                <p className="td-text">{team.description}</p>
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Напрямки</h3>
                <div className="tags">
                  {team.directions.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </section>

              <section className="td-section mt-24">
                <h3 className="td-section-title">Посилання</h3>
                <div className="social-links-list">
                  {team.links.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="text-purple">
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </section>
              <p className="text-sm-muted mt-24 fs-12">Дата створення: {team.createdAt}</p>
            </div>
          </div>
        </div>

        {/* ПРАВА ПАНЕЛЬ */}
        <aside className="td-sidebar-wrap">
          <div className="card td-sidebar">
            <div className="sidebar-actions">
              {joinStatus === 'guest' && (
                <button className="btn btn-primary btn-block" onClick={handleJoin}>Доєднатися</button>
              )}
              {joinStatus === 'pending' && (
                <button className="btn btn-secondary btn-block" disabled>Запит надіслано</button>
              )}
              <button className="btn btn-outline btn-block mt-12">Поділитись ↗</button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-owner">
              <h3 className="td-sidebar-heading mb-12">Склад команди</h3>
              {['Admin', 'Helper', 'Member'].map(role => (
                <div key={role} className="roster-group mb-12">
                  <p className="role-label">{role === 'Admin' ? 'Адміни' : role === 'Helper' ? 'Помічники' : 'Учасники'}</p>
                  {members.filter(m => m.role === role).map(m => (
                    <div key={m.id} className="member-row">
                      <img src={m.avatar} className="avatar avatar-sm" alt={m.name} />
                      <span className="text-white fs-14">{m.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="card-divider my-24"></div>

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
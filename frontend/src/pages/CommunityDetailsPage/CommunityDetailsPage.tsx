import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../assets/styles/DetailsPage.css";

interface CommunityMember {
  id: number;
  name: string;
  avatar: string;
  role: 'Moderator' | 'Contributor' | 'Member';
}

const CommunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [joinStatus, setJoinStatus] = useState<'guest' | 'pending' | 'member'>('guest');

  const community = {
    name: "AI Enthusiasts",
    memberCount: 150,
    description: "Наша місія — об'єднати людей, які цікавляться штучним інтелектом, для спільного навчання, розробки проєктів та обміну досвідом у сфері ML та Data Science. Ми віримо, що майбутнє за технологіями, і хочемо зробити їх доступними для кожного.",
    topics: ["#machine_learning", "#data_science", "#python", "#neural_networks"],
    rules: [
      "Будьте ввічливими та поважайте інших учасників.",
      "Діліться лише перевіреною інформацією та корисними ресурсами.",
      "Жодного спаму або несанкціонованої реклами.",
      "Допомагайте новачкам розібратися в складних темах."
    ],
    createdAt: "10.01.2025",
    statistics: { views: 1240, posts: 89 },
    links: [
      { label: "Discord", url: "https://discord.com" },
      { label: "Telegram", url: "https://t.me" },
      { label: "Сайт", url: "https://google.com" }
    ]
  };

  const members: CommunityMember[] = [
    { id: 1, name: "Олексій М.", avatar: "https://via.placeholder.com/40", role: 'Moderator' },
    { id: 2, name: "Анна К.", avatar: "https://via.placeholder.com/40", role: 'Contributor' },
    { id: 3, name: "Максим Р.", avatar: "https://via.placeholder.com/40", role: 'Member' },
  ];

  return (
    <div className="task-details-page">
      <div className="td-layout">

        <div className="td-main">
          <div className="card mb-24">
            <div className="td-header">
              <div className="entity-header-flex">
                <div className="entity-avatar circle">AI</div>
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

              <section className="info-box">
                <h3 className="td-section-title">Правила спільноти</h3>
                <ul className="td-list">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="text-sm-muted">• {rule}</li>
                  ))}
                </ul>
              </section>

              <section className="td-section">
                <h3 className="td-section-title">Теми</h3>
                <div className="tags">
                  {community.topics.map(topic => (
                    <span key={topic} className="tag">{topic}</span>
                  ))}
                </div>
              </section>

              <section className="td-section mt-24">
                <h3 className="td-section-title">Корисні посилання</h3>
                <ul className="td-list">
                  {community.links.map(link => (
                    <li key={link.label}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-sm-muted mt-auto pt-24 fs-12">Дата створення: {community.createdAt}</p>
            </div>
          </div>
        </div>

        <aside className="td-sidebar-wrap">
          <div className="card td-sidebar">
            <div className="sidebar-actions">
              {joinStatus === 'guest' && (
                <button className="btn btn-primary btn-block" onClick={() => setJoinStatus('pending')}>Доєднатися</button>
              )}
              {joinStatus === 'pending' && (
                <button className="btn btn-secondary btn-block" disabled>Запит надіслано</button>
              )}
              <button className="btn btn-outline btn-block mt-12">Поділитись ↗</button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-roster">
              <h3 className="td-sidebar-heading mb-12">Учасники</h3>
              {['Moderator', 'Contributor', 'Member'].map(role => (
                <div key={role} className="roster-group mb-12">
                  <p className="role-label">
                    {role === 'Moderator' ? 'Модератори' : role === 'Contributor' ? 'Контриб\'ютори' : 'Учасники'}
                  </p>
                  {members.filter(m => m.role === role).map(m => (
                    <div key={m.id} className="member-row">
                      <img src={m.avatar} className="avatar avatar-sm" alt="" />
                      <span className="text-white fs-14 fw-600">{m.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="card-divider mt-auto my-24"></div>

            <div className="td-stats">
              <h3 className="td-sidebar-heading mb-12">Статистика</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <p className="stat-val">{community.statistics.views}</p>
                  <p className="text-sm-muted">Переглядів</p>
                </div>
                <div className="stat-box">
                  <p className="stat-val">{community.statistics.posts}</p>
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
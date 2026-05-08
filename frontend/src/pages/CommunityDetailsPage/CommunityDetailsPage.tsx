import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./CommunityDetailsPage.css";

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
          <div className="card main-card">
            <div className="td-header">
              <div className="community-header-flex">
                <div className="community-avatar-circle">AI</div>
                <div>
                  <h2 className="td-title-large">{community.name}</h2>
                  <div className="team-stats-row">
                    <span className="text-sm-muted">{community.memberCount} учасників</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-divider-heavy mt-24 mb-32"></div>

            <div className="td-content">
              <section className="td-section">
                <h3 className="td-section-title-large">Про спільноту</h3>
                <p className="td-text-large">{community.description}</p>
              </section>

              <section className="td-section community-rules-box">
                <h3 className="td-section-title-large">Правила спільноти</h3>
                <ul className="rules-list">
                  {community.rules.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </section>

              <section className="td-section">
                <h3 className="td-section-title-large">Теми</h3>
                <div className="tags-large">
                  {community.topics.map(topic => (
                    <span key={topic} className="tag-large topic-tag">{topic}</span>
                  ))}
                </div>
              </section>

              <section className="td-section mt-24">
                <h3 className="td-section-title-large">Корисні посилання</h3>
                <div className="social-links-list-large">
                  {community.links.map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="text-purple">
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </section>
              <p className="text-sm-muted mt-auto pt-24 fs-12">Дата створення: {community.createdAt}</p>
            </div>
          </div>
        </div>

        <aside className="td-sidebar-wrap">
          <div className="card sidebar-card">
            <div className="sidebar-actions">
              <button className="btn btn-primary btn-block" onClick={() => setJoinStatus('pending')}>
                {joinStatus === 'pending' ? 'Запит надіслано' : 'Доєднатися'}
              </button>
              <button className="btn btn-outline btn-block mt-12">Поділитись ↗</button>
            </div>

            <div className="card-divider my-24"></div>

            <div className="td-roster">
              <h3 className="td-sidebar-heading mb-12">Учасники</h3>
              {['Moderator', 'Contributor', 'Member'].map(role => (
                <div key={role} className="roster-group mb-12">
                  <p className="role-label-sidebar">
                    {role === 'Moderator' ? 'Модератори' : role === 'Contributor' ? 'Контриб\'ютори' : 'Учасники'}
                  </p>
                  {members.filter(m => m.role === role).map(m => (
                    <div key={m.id} className="member-row-sidebar">
                      <img src={m.avatar} className="avatar-sidebar" alt="" />
                      <span className="text-white fs-14">{m.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="card-divider mt-auto my-24"></div>

            <div className="td-stats">
              <div className="stats-grid-sidebar">
                <div className="stat-item">
                  <span className="stat-number">{community.statistics.views}</span>
                  <span className="stat-label">Переглядів</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{community.statistics.posts}</span>
                  <span className="stat-label">Публікацій</span>
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
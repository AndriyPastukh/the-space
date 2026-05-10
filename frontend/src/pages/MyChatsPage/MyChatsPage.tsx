import React, { useState, useMemo, useEffect } from 'react';
import './MyChatsPage.css';

// Типи даних
type ChatMainTab = 'personal' | 'executors' | 'customers';
type ChatSubfilter = 'knowledge' | 'tasks';

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMine: boolean;
}

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  mainTab: ChatMainTab;
  type: 'tasks' | 'knowledge';
  avatar: string;
}

const MyChatsPage: React.FC = () => {
  // Стан для панелей та фільтрів
  const [activeTab, setActiveTab] = useState<ChatMainTab>('personal');
  const [subfilter, setSubfilter] = useState<ChatSubfilter | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string>('1');
  const [isLinkedHidden, setIsLinkedHidden] = useState(false);
  const [isListHidden, setIsListHidden] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // Мокові дані чатів (AC2, AC3, AC7, AC8)
  const chats: ChatItem[] = [
    { id: '1', name: 'Roman K. D.', lastMessage: 'Let’s go grab a beer..', lastMessageTime: '14:20', mainTab: 'personal', type: 'knowledge', avatar: 'RK' },
    { id: '2', name: 'Ivan R. V.', lastMessage: 'Design is ready', lastMessageTime: '12:05', mainTab: 'executors', type: 'tasks', avatar: 'IR' },
    { id: '3', name: 'Anna M.', lastMessage: 'When will you be free?', lastMessageTime: 'Вчора', mainTab: 'personal', type: 'tasks', avatar: 'AM' },
  ];

  // Мокові повідомлення для активного чату (AC5)
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', senderId: 'other', text: 'Привіт! Як справи з проектом?', time: '14:15', isMine: false },
    { id: 'm2', senderId: 'other', text: 'Ти встигаєш доробити навігацію?', time: '14:16', isMine: false },
    { id: 'm3', senderId: 'me', text: 'Привіт! Так, вже майже закінчив. Додаю останні штрихи до мобільної версії.', time: '14:20', isMine: true },
  ]);

  // Фільтрація списку чатів
  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const matchTab = chat.mainTab === activeTab;
      const matchSub = !subfilter || chat.type === subfilter;
      return matchTab && matchSub;
    });
  }, [activeTab, subfilter]);

  const activeChat = chats.find(c => c.id === selectedChatId);

  // Відправка повідомлення (AC6)
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput,
      time: timeString,
      isMine: true,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div className={`the-space-chats ${isLinkedHidden ? 'no-linked' : ''} ${isListHidden ? 'no-list' : ''}`}>
      
      {/* ЛІВА ПАНЕЛЬ: Linked Chats */}
      {!isLinkedHidden ? (
        <aside className="linked-sidebar">
          <div className="sidebar-header">
            <span>Linked Chats</span>
            <button className="collapse-btn" onClick={() => setIsLinkedHidden(true)}>«</button>
          </div>
          
          <div className="linked-card">
            <div className="user-info">
              <div className="avatar-placeholder pink">IR</div>
              <span className="username">Ivan R. V.</span>
            </div>
            <p className="description">Навігаційна панель для сайту (Figma)...</p>
            <div className="tags">
              <span className="tag">design</span> <span className="tag">react</span> <span className="tag-more">+2</span>
            </div>
          </div>
        </aside>
      ) : (
        <div className="collapsed-bar" onClick={() => setIsLinkedHidden(false)}>Linked</div>
      )}

      {/* СЕРЕДНЯ ПАНЕЛЬ: Список чатів */}
      {!isListHidden ? (
        <section className="chats-list-panel">
          <div className="sidebar-header">
            <h1 className="title">My Chats</h1>
            <button className="collapse-btn" onClick={() => setIsListHidden(true)}>«</button>
          </div>
          
          <div className="tabs-nav">
            <div className="main-tabs">
              {['Personal', 'Executors', 'Customers'].map(t => (
                <button 
                  key={t} 
                  className={`tab-link ${activeTab === t.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.toLowerCase() as ChatMainTab)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="sub-filters">
              <button className={`filter-btn ${subfilter === 'knowledge' ? 'active' : ''}`} onClick={() => setSubfilter(subfilter === 'knowledge' ? null : 'knowledge')}>Knowledge</button>
              <button className={`filter-btn ${subfilter === 'tasks' ? 'active' : ''}`} onClick={() => setSubfilter(subfilter === 'tasks' ? null : 'tasks')}>Tasks</button>
            </div>
          </div>

          <div className="chat-previews">
            {filteredChats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-preview-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <div className="avatar-placeholder">{chat.avatar}</div>
                <div className="preview-content">
                  <div className="preview-top">
                    <span className="preview-name">{chat.name}</span>
                    <span className="preview-time">{chat.lastMessageTime}</span>
                  </div>
                  <div className="preview-msg">{chat.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="collapsed-bar" onClick={() => setIsListHidden(false)}>Messages</div>
      )}

      {/* ПРАВА ПАНЕЛЬ: Активний чат */}
      <main className="active-chat-panel">
        <header className="chat-header">
          <div className="header-left">
            {isListHidden && <button className="expand-btn" onClick={() => setIsListHidden(false)}>»</button>}
            <h2>{activeChat?.name || 'Оберіть чат'}</h2>
          </div>
          <span className="date-stamp">23.03.2026</span>
        </header>

        <div className="messages-area">
          {messages.map(msg => (
            <div key={msg.id} className={`msg-row ${msg.isMine ? 'outgoing' : 'incoming'}`}>
              {!msg.isMine && <div className="avatar-xs">{activeChat?.avatar}</div>}
              <div className="msg-bubble">
                <div className="msg-text">{msg.text}</div>
                <div className="msg-time">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        <footer className="chat-footer">
          <div className="input-wrapper">
            <button className="attach-button" onClick={() => alert('Виберіть файл')}>📎</button>
            <input 
              type="text" 
              placeholder="Напишіть повідомлення..." 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-button" onClick={handleSendMessage}>➤</button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MyChatsPage;
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./MyChatsPage.css";

type ChatMainTab = "personal" | "executors" | "customers";
type ChatSubfilter = "knowledge" | "tasks";
type MobileDrawer = "linked" | "chats" | null;

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
  type: "tasks" | "knowledge";
  avatar: string;
}

const MyChatsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ChatMainTab>("personal");
  const [subfilter, setSubfilter] = useState<ChatSubfilter | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string>("1");
  const [isLinkedHidden, setIsLinkedHidden] = useState(false);
  const [isListHidden, setIsListHidden] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawer>(null);

  const messagesAreaRef = useRef<HTMLDivElement | null>(null);

  const chats: ChatItem[] = [
    {
      id: "1",
      name: "Roman K. D.",
      lastMessage: "Let’s go grab a beer..",
      lastMessageTime: "14:20",
      mainTab: "personal",
      type: "knowledge",
      avatar: "RK",
    },
    {
      id: "2",
      name: "Ivan R. V.",
      lastMessage: "Design is ready",
      lastMessageTime: "12:05",
      mainTab: "executors",
      type: "tasks",
      avatar: "IR",
    },
    {
      id: "3",
      name: "Anna M.",
      lastMessage: "When will you be free?",
      lastMessageTime: "Вчора",
      mainTab: "personal",
      type: "tasks",
      avatar: "AM",
    },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      senderId: "other",
      text: "Привіт! Як справи з проектом?",
      time: "14:15",
      isMine: false,
    },
    {
      id: "m2",
      senderId: "other",
      text: "Ти встигаєш доробити навігацію?",
      time: "14:16",
      isMine: false,
    },
    {
      id: "m3",
      senderId: "me",
      text: "Привіт! Так, вже майже закінчив. Додаю останні штрихи до мобільної версії.",
      time: "14:20",
      isMine: true,
    },
  ]);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!mobileDrawer) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileDrawer(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileDrawer]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchTab = chat.mainTab === activeTab;
      const matchSubfilter = !subfilter || chat.type === subfilter;

      return matchTab && matchSubfilter;
    });
  }, [activeTab, subfilter]);

  const activeChat = chats.find((chat) => chat.id === selectedChatId);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setMobileDrawer(null);
  };

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();

    if (!trimmedMessage) return;

    const now = new Date();
    const timeString = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: trimmedMessage,
      time: timeString,
      isMine: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  return (
    <div
      className={[
        "the-space-chats",
        isLinkedHidden ? "no-linked" : "",
        isListHidden ? "no-list" : "",
        mobileDrawer ? "mobile-drawer-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {mobileDrawer && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawer(null)}
          aria-hidden="true"
        />
      )}

      {!isLinkedHidden ? (
        <aside
          className={`linked-sidebar ${
            mobileDrawer === "linked" ? "mobile-open" : ""
          }`}
        >
          <div className="sidebar-header">
            <span>Linked Chats</span>

            <div className="sidebar-actions">
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMobileDrawer(null)}
                aria-label="Close linked chats"
              >
                ×
              </button>

              <button
                type="button"
                className="collapse-btn"
                onClick={() => setIsLinkedHidden(true)}
                aria-label="Collapse linked chats"
              >
                «
              </button>
            </div>
          </div>

          <div className="linked-card">
            <div className="user-info">
              <div className="avatar-placeholder pink">IR</div>
              <span className="username">Ivan R. V.</span>
            </div>

            <p className="description">
              Навігаційна панель для сайту (Figma)...
            </p>

            <div className="tags">
              <span className="tag">design</span>
              <span className="tag">react</span>
              <span className="tag-more">+2</span>
            </div>
          </div>
        </aside>
      ) : (
        <div
          className="collapsed-bar"
          onClick={() => setIsLinkedHidden(false)}
          role="button"
          tabIndex={0}
        >
          Linked
        </div>
      )}

      {!isListHidden ? (
        <section
          className={`chats-list-panel ${
            mobileDrawer === "chats" ? "mobile-open" : ""
          }`}
        >
          <div className="sidebar-header">
            <h1 className="title">My Chats</h1>

            <div className="sidebar-actions">
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMobileDrawer(null)}
                aria-label="Close chats list"
              >
                ×
              </button>

              <button
                type="button"
                className="collapse-btn"
                onClick={() => setIsListHidden(true)}
                aria-label="Collapse chats list"
              >
                «
              </button>
            </div>
          </div>

          <div className="tabs-nav">
            <div className="main-tabs">
              {[
                { label: "Personal", value: "personal" },
                { label: "Executors", value: "executors" },
                { label: "Customers", value: "customers" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`tab-link ${
                    activeTab === tab.value ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.value as ChatMainTab)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="sub-filters">
              <button
                type="button"
                className={`filter-btn ${
                  subfilter === "knowledge" ? "active" : ""
                }`}
                onClick={() =>
                  setSubfilter(subfilter === "knowledge" ? null : "knowledge")
                }
              >
                Knowledge
              </button>

              <button
                type="button"
                className={`filter-btn ${
                  subfilter === "tasks" ? "active" : ""
                }`}
                onClick={() =>
                  setSubfilter(subfilter === "tasks" ? null : "tasks")
                }
              >
                Tasks
              </button>
            </div>
          </div>

          <div className="chat-previews">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-preview-item ${
                  selectedChatId === chat.id ? "selected" : ""
                }`}
                onClick={() => handleSelectChat(chat.id)}
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
        <div
          className="collapsed-bar"
          onClick={() => setIsListHidden(false)}
          role="button"
          tabIndex={0}
        >
          Messages
        </div>
      )}

      <main className="active-chat-panel">
        <header className="chat-header">
          <div className="mobile-chat-nav">
            <button
              type="button"
              onClick={() => {
                setIsLinkedHidden(false);
                setMobileDrawer("linked");
              }}
            >
              Linked
            </button>

            <button
              type="button"
              onClick={() => {
                setIsListHidden(false);
                setMobileDrawer("chats");
              }}
            >
              Chats
            </button>
          </div>

          <div className="header-left">
            {isListHidden && (
              <button
                type="button"
                className="expand-btn"
                onClick={() => setIsListHidden(false)}
                aria-label="Expand chats list"
              >
                »
              </button>
            )}

            <h2>{activeChat?.name || "Оберіть чат"}</h2>
          </div>

          <span className="date-stamp">23.03.2026</span>
        </header>

        <div className="messages-area" ref={messagesAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`msg-row ${message.isMine ? "outgoing" : "incoming"}`}
            >
              {!message.isMine && (
                <div className="avatar-xs">{activeChat?.avatar}</div>
              )}

              <div className="msg-bubble">
                <div className="msg-text">{message.text}</div>
                <div className="msg-time">{message.time}</div>
              </div>
            </div>
          ))}
        </div>

        <footer className="chat-footer">
          <div className="input-wrapper">
            <button
              type="button"
              className="attach-button"
              onClick={() => alert("Виберіть файл")}
              aria-label="Attach file"
            >
              📎
            </button>

            <input
              type="text"
              placeholder="Напишіть повідомлення..."
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />

            <button
              type="button"
              className="send-button"
              onClick={handleSendMessage}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MyChatsPage;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./MyChatsPage.css";
import { useChats } from "../../hooks/useChats";

type ChatMainTab = "personal" | "executors" | "customers";
type ChatSubfilter = "knowledge" | "tasks";
type MobileDrawer = "linked" | "chats" | null;

const MyChatsPage: React.FC = () => {
  const {
    chats,
    messages,
    selectedChatId,
    setSelectedChatId,
    isChatsLoading,
    isMessagesLoading,
    chatsError,
    messagesError,
    sendMessage,
  } = useChats();

  const location = useLocation();

  useEffect(() => {
    const stateChatId = location.state?.selectedChatId;
    if (stateChatId) {
      setSelectedChatId(Number(stateChatId));
    }
  }, [location, setSelectedChatId]);

  const [activeTab, setActiveTab] = useState<ChatMainTab>("personal");
  const [subfilter, setSubfilter] = useState<ChatSubfilter | null>(null);
  const [isLinkedHidden, setIsLinkedHidden] = useState(false);
  const [isListHidden, setIsListHidden] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawer>(null);

  const messagesAreaRef = useRef<HTMLDivElement | null>(null);

  // Map API chats to UI components format
  const mappedChats = useMemo(() => {
    return chats.map((c) => {
      const name = c.otherParticipant
        ? `${c.otherParticipant.firstName} ${c.otherParticipant.lastName}`
        : "Користувач";
      const initials = c.otherParticipant
        ? `${c.otherParticipant.firstName[0] || ""}${
            c.otherParticipant.lastName[0] || ""
          }`.toUpperCase()
        : "U";

      // Format last message timestamp
      let lastMessageTime = "";
      if (c.lastMessage) {
        const date = new Date(c.lastMessage.createdAt);
        if (!isNaN(date.getTime())) {
          lastMessageTime = `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        }
      }

      return {
        id: String(c.id),
        name,
        lastMessage: c.lastMessage?.content || "Немає повідомлень",
        lastMessageTime,
        mainTab: "personal" as const, // all direct user chats are personal
        type: "tasks" as const, // placeholder
        avatar: initials,
        unreadCount: c.unreadCount,
      };
    });
  }, [chats]);

  // Map API messages to UI format
  const mappedMessages = useMemo(() => {
    return messages.map((m) => {
      const date = new Date(m.createdAt);
      const time = isNaN(date.getTime())
        ? ""
        : `${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
      return {
        id: String(m.id),
        senderId: String(m.senderId),
        text: m.content,
        time,
        isMine: m.isMine,
      };
    });
  }, [messages]);

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
    return mappedChats.filter((chat) => {
      const matchTab = chat.mainTab === activeTab;
      const matchSubfilter = !subfilter || chat.type === subfilter;
      return matchTab && matchSubfilter;
    });
  }, [mappedChats, activeTab, subfilter]);

  const activeChat = mappedChats.find((chat) => chat.id === String(selectedChatId));

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(Number(chatId));
    setMobileDrawer(null);
  };

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage) return;

    sendMessage(trimmedMessage);
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
            <span>Зв'язані контексти</span>

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

          <div
            className="linked-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-muted)",
              height: "200px",
            }}
          >
            <span style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</span>
            <p style={{ fontSize: "14px" }}>
              Чат ведеться напряму. Немає прив'язаного завдання чи знання.
            </p>
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
            <h1 className="title">Мої чати</h1>

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
                { label: "Особисті", value: "personal" },
                { label: "Виконавці", value: "executors" },
                { label: "Замовники", value: "customers" },
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
                Знання
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
                Завдання
              </button>
            </div>
          </div>

          <div className="chat-previews">
            {isChatsLoading ? (
              <p style={{ textAlign: "center", padding: "20px" }}>
                Завантаження...
              </p>
            ) : chatsError ? (
              <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
                {chatsError}
              </p>
            ) : filteredChats.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ fontSize: "24px" }}>💬</span>
                <p style={{ fontSize: "14px", marginTop: "8px" }}>
                  {activeTab === "personal"
                    ? "У вас немає активних особистих чатів."
                    : "Немає чатів у цій категорії."}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-preview-item ${
                    String(selectedChatId) === chat.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="avatar-placeholder">{chat.avatar}</div>

                  <div className="preview-content">
                    <div className="preview-top">
                      <span className="preview-name">{chat.name}</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span className="preview-time">
                          {chat.lastMessageTime}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span
                            className="unread-badge"
                            style={{
                              background: "var(--purple)",
                              color: "white",
                              borderRadius: "10px",
                              padding: "2px 6px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="preview-msg">{chat.lastMessage}</div>
                  </div>
                </div>
              ))
            )}
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
        {selectedChatId === null ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              color: "var(--text-muted)",
            }}
          >
            <span style={{ fontSize: "48px", marginBottom: "16px" }}>💬</span>
            <h2>Оберіть чат, щоб почати спілкування</h2>
          </div>
        ) : (
          <>
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

                <h2>{activeChat?.name || "Чат"}</h2>
              </div>
            </header>

            <div className="messages-area" ref={messagesAreaRef}>
              {isMessagesLoading ? (
                <p style={{ textAlign: "center", padding: "20px" }}>
                  Завантаження повідомлень...
                </p>
              ) : messagesError ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "red",
                  }}
                >
                  {messagesError}
                </p>
              ) : mappedMessages.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  Немає повідомлень. Напишіть щось першим!
                </p>
              ) : (
                mappedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`msg-row ${
                      message.isMine ? "outgoing" : "incoming"
                    }`}
                  >
                    {!message.isMine && (
                      <div className="avatar-xs">{activeChat?.avatar}</div>
                    )}

                    <div className="msg-bubble">
                      <div className="msg-text">{message.text}</div>
                      <div className="msg-time">{message.time}</div>
                    </div>
                  </div>
                ))
              )}
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
          </>
        )}
      </main>
    </div>
  );
};

export default MyChatsPage;

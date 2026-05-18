import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKnowledge } from "../../hooks/useKnowledge";
import { useCategories } from "../../hooks/useCategories";
import { useAuth } from "../../hooks/useAuth";
import { updateKnowledge } from "../../features/knowledges/knowledgeApi";
import KnowledgeForm, { type KnowledgeFormState } from "../CreatePage/components/KnowledgeForm/KnowledgeForm";
import "../CreatePage/CreateExperiencePage.css";

export default function EditKnowledgePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthLoading } = useAuth();
  const { knowledge, isLoading, error: fetchError } = useKnowledge({ id });
  const { categories } = useCategories();

  const [formState, setFormState] = useState<KnowledgeFormState>({
    offerDescription: "",
    offerCategories: [],
    requestDescription: "",
    requestCategories: [],
    deadline: "",
    urls: [],
    files: [],
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (knowledge) {
      setFormState({
        offerDescription: knowledge.offerDescription || "",
        offerCategories: knowledge.offerCategories?.map((c: any) => c.id) || [],
        requestDescription: knowledge.requestDescription || "",
        requestCategories: knowledge.requestCategories?.map((c: any) => c.id) || [],
        deadline: knowledge.deadline ? new Date(knowledge.deadline).toISOString().split("T")[0] : "",
        urls: knowledge.urls || [],
        files: [],
      });
    }
  }, [knowledge]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="form-page">
        <div className="form-container">
          <p className="loading-text">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !knowledge) {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="message error">{fetchError || "Знання не знайдено"}</div>
        </div>
      </div>
    );
  }

  const isOwner = user && knowledge.authorId === user.id;

  if (!isOwner) {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="message error">Ви не є власником цього запису знань. Редагувати заборонено.</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (state: KnowledgeFormState) => {
    // Only send fields supported by the backend update DTO
    const payload = {
      offerDescription: state.offerDescription,
      offerCategories: state.offerCategories,
      requestDescription: state.requestDescription,
      requestCategories: state.requestCategories,
      deadline: state.deadline,
      urls: state.urls,
    };

    await updateKnowledge(knowledge.id, payload);
    setMessage({ text: "Знання успішно оновлено!", type: "success" });
    setTimeout(() => {
      navigate(`/knowledges/${knowledge.id}`);
    }, 1000);
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="create-header">
          <h1 className="form-title create-title">Редагувати знання</h1>
        </div>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        <KnowledgeForm
          formState={formState}
          onChange={setFormState}
          categories={categories}
          onClear={() => {}}
          setMessage={setMessage}
          onSuccess={() => {}}
          mode="edit"
          submitButtonText="Зберегти зміни"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

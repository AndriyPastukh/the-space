import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTask } from "../../hooks/useTask";
import { useCategories } from "../../hooks/useCategories";
import { useAuth } from "../../hooks/useAuth";
import { updateTask } from "../../features/tasks/taskApi";
import TaskForm, { type TaskFormState } from "../CreatePage/components/TaskForm/TaskForm";
import "../CreatePage/CreateExperiencePage.css";

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthLoading } = useAuth();
  const { task, isLoading, error: fetchError } = useTask({ id });
  const { categories } = useCategories();

  const [formState, setFormState] = useState<TaskFormState>({
    title: "",
    categories: [],
    description: "",
    deadline: "",
    urls: [],
    files: [],
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (task) {
      setFormState({
        title: task.title || "",
        categories: task.categories?.map((c: any) => c.id) || [],
        description: task.description || "",
        deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "",
        urls: task.urls || [],
        files: [],
      });
    }
  }, [task]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="form-page">
        <div className="form-container">
          <p className="loading-text">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !task) {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="message error">{fetchError || "Таск не знайдено"}</div>
        </div>
      </div>
    );
  }

  const isOwner = user && task.authorId === user.id;

  if (!isOwner) {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="message error">Ви не є власником цього таску. Редагувати заборонено.</div>
        </div>
      </div>
    );
  }

  if (task.status !== "OPEN") {
    return (
      <div className="form-page">
        <div className="form-container">
          <div className="message error">Редагувати можна лише завдання у статусі ВІДКРИТО.</div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (state: TaskFormState) => {
    // Only send fields supported by the backend update DTO
    const payload = {
      title: state.title,
      description: state.description,
      categories: state.categories,
      deadline: state.deadline,
      urls: state.urls,
    };

    await updateTask(task.id, payload);
    setMessage({ text: "Завдання успішно оновлено!", type: "success" });
    setTimeout(() => {
      navigate(`/tasks/${task.id}`);
    }, 1000);
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="create-header">
          <h1 className="form-title create-title">Редагувати завдання</h1>
        </div>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        <TaskForm
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

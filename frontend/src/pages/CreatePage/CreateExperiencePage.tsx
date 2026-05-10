import { useState } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom"; // Додано useNavigate
import TaskForm from './components/TaskForm/TaskForm';
import KnowledgeForm from './components/KnowledgeForm/KnowledgeForm';
import type { TaskFormState } from './components/TaskForm/TaskForm';
import type { KnowledgeFormState } from './components/KnowledgeForm/KnowledgeForm';
import './CreateExperiencePage.css';
import { useCategories } from '../../hooks/useCategories';

type Tab = 'task' | 'knowledge';

const initialTaskState: TaskFormState = {
    title: '',
    categories: [],
    description: '',
    deadline: '',
    urls: [],
    files: [],
};

const initialKnowledgeState: KnowledgeFormState = {
    offerCategories: [],
    offerDescription: '',
    requestCategories: [],
    requestDescription: '',
    deadline: '',
    urls: [],
    files: [],
};

export default function CreateExperiencePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const typeParam = searchParams.get("type");
    const activeTab: Tab = typeParam === "knowledge" ? "knowledge" : "task";

    const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskState);
    const [knowledgeForm, setKnowledgeForm] = useState<KnowledgeFormState>(initialKnowledgeState);
    
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const { categories } = useCategories();

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="create-header">
                    <h1 className="form-title create-title">Створити:</h1>
                    <div className="create-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'task' ? 'tab-btn--active' : ''}`}
                            onClick={() => {setSearchParams({ type: "task" }); setMessage(null);}}
                        >
                            Task
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'knowledge' ? 'tab-btn--active' : ''}`}
                            onClick={() => {setSearchParams({ type: "knowledge" }); setMessage(null);}}
                        >
                            Knowledge
                        </button>
                    </div>
                </div>

                {/* Відображення повідомлення */}
                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'task' ? (
    <TaskForm
        formState={taskForm}
        onChange={setTaskForm}
        categories={categories}
        onClear={() => setTaskForm(initialTaskState)}
        setMessage={setMessage} 
        onSuccess={(id) => navigate(`/tasks/${id}`)} 
    />
) : (
    <KnowledgeForm
        formState={knowledgeForm}
        onChange={setKnowledgeForm}
        categories={categories}
        onClear={() => setKnowledgeForm(initialKnowledgeState)}
        setMessage={setMessage}
        onSuccess={(id) => navigate(`/knowledges/${id}`)}
    />
)}
            </div>
        </div>
    );
}
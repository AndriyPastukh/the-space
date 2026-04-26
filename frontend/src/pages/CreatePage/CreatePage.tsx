import { useState } from 'react';
import TaskForm from './components/TaskForm/TaskForm';
import KnowledgeForm from './components/KnowledgeForm/KnowledgeForm';
import type { TaskFormState } from './components/TaskForm/TaskForm';
import type { KnowledgeFormState } from './components/KnowledgeForm/KnowledgeForm';
import './CreatePage.css';

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
    wantCategories: [],
    wantDescription: '',
    deadline: '',
    urls: [],
    files: [],
};

export default function CreatePage() {
    const [activeTab, setActiveTab] = useState<Tab>('task');
    const [taskForm, setTaskForm] = useState<TaskFormState>(initialTaskState);
    const [knowledgeForm, setKnowledgeForm] = useState<KnowledgeFormState>(initialKnowledgeState);

    return (
        <div className="create-page">
            <div className="create-container">
                <div className="create-header">
                    <h1 className="create-title">Створити:</h1>
                    <div className="create-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'task' ? 'tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('task')}
                        >
                            Task
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'knowledge' ? 'tab-btn--active' : ''}`}
                            onClick={() => setActiveTab('knowledge')}
                        >
                            Knowledge
                        </button>
                    </div>
                </div>

                {activeTab === 'task' ? (
                    <TaskForm
                        formState={taskForm}
                        onChange={setTaskForm}
                        onClear={() => setTaskForm(initialTaskState)}
                    />
                ) : (
                    <KnowledgeForm
                        formState={knowledgeForm}
                        onChange={setKnowledgeForm}
                        onClear={() => setKnowledgeForm(initialKnowledgeState)}
                    />
                )}
            </div>
        </div>
    );
}
const SAVED_TASK_IDS_KEY = "the-space:saved-task-ids";

const readSavedTaskIds = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(SAVED_TASK_IDS_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
};

const writeSavedTaskIds = (taskIds: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_TASK_IDS_KEY, JSON.stringify(taskIds));
};

export const getSavedTaskIds = (): string[] => readSavedTaskIds();

export const isTaskSaved = (taskId: string): boolean =>
  readSavedTaskIds().includes(taskId);

export const toggleSavedTask = (taskId: string): boolean => {
  const savedTaskIds = readSavedTaskIds();
  const nextTaskIds = savedTaskIds.includes(taskId)
    ? savedTaskIds.filter((savedId) => savedId !== taskId)
    : [...savedTaskIds, taskId];

  writeSavedTaskIds(nextTaskIds);

  return nextTaskIds.includes(taskId);
};

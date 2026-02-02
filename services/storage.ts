
import { User, Task, TaskStatus, TaskPriority, EnergyLevel, TaskCategory } from '../types';

const USERS_KEY = 'zenai_users';
const CURRENT_USER_KEY = 'zenai_current_user';
const TASKS_KEY_PREFIX = 'zenai_tasks_';
const REFLECTIONS_KEY_PREFIX = 'zenai_reflections_';

export const storageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = storageService.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing > -1) users[existing] = user;
    else users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const current = storageService.getCurrentUser();
    if (current && current.id === user.id) {
      storageService.setCurrentUser(user);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
  },

  getTasks: (userId: string): Task[] => {
    const data = localStorage.getItem(`${TASKS_KEY_PREFIX}${userId}`);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (userId: string, tasks: Task[]) => {
    localStorage.setItem(`${TASKS_KEY_PREFIX}${userId}`, JSON.stringify(tasks));
  },

  addTask: (
    userId: string, 
    text: string, 
    priority: TaskPriority = TaskPriority.MEDIUM,
    energy: EnergyLevel = EnergyLevel.MEDIUM,
    time: string = "15m",
    category: TaskCategory = TaskCategory.PERSONAL
  ): Task => {
    const tasks = storageService.getTasks(userId);
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      text,
      status: TaskStatus.PENDING,
      priority,
      energyLevel: energy,
      estimatedTime: time,
      category,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    storageService.saveTasks(userId, tasks);
    return newTask;
  },

  toggleTask: (userId: string, taskId: string): { task: Task; xpGained: number } | null => {
    const tasks = storageService.getTasks(userId);
    let xpGained = 0;
    let updatedTask: Task | null = null;

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isCompleting = t.status === TaskStatus.PENDING;
        if (isCompleting) {
          const priorityMap = { [TaskPriority.CRITICAL]: 50, [TaskPriority.HIGH]: 30, [TaskPriority.MEDIUM]: 15, [TaskPriority.LOW]: 5 };
          const energyMap = { [EnergyLevel.HIGH]: 25, [EnergyLevel.MEDIUM]: 10, [EnergyLevel.LOW]: 5 };
          xpGained = priorityMap[t.priority] + energyMap[t.energyLevel];
        }
        updatedTask = { 
          ...t, 
          status: isCompleting ? TaskStatus.COMPLETED : TaskStatus.PENDING,
          completedAt: isCompleting ? new Date().toISOString() : undefined
        };
        return updatedTask;
      }
      return t;
    });

    storageService.saveTasks(userId, updated);
    return updatedTask ? { task: updatedTask, xpGained } : null;
  },

  // Fix: Implemented missing deleteTask method to resolve the reported error.
  deleteTask: (userId: string, taskId: string) => {
    const tasks = storageService.getTasks(userId);
    const updated = tasks.filter(t => t.id !== taskId);
    storageService.saveTasks(userId, updated);
  },

  updateUserStats: (userId: string, xpToAdd: number, taskCompleted: boolean = false) => {
    const users = storageService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    const user = users[idx];
    user.xp += xpToAdd;
    if (taskCompleted) user.totalTasksCompleted += 1;
    
    // Level Math: 100 XP base, increases per level
    const newLevel = Math.floor(Math.sqrt(user.xp / 50)) + 1;
    user.level = newLevel;

    // Streak Logic
    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastActiveDate;
    
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        user.streak += 1;
      } else {
        user.streak = 1; 
      }
      user.lastActiveDate = today;
      if (user.streak > user.bestStreak) user.bestStreak = user.streak;
    }

    storageService.saveUser(user);
    return user;
  },

  exportData: (userId: string) => {
    const tasks = storageService.getTasks(userId);
    const user = storageService.getCurrentUser();
    const data = { user, tasks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenai_export_${userId}.json`;
    a.click();
  }
};

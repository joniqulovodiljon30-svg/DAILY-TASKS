
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum EnergyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskCategory {
  WORK = 'work',
  STUDY = 'study',
  HEALTH = 'health',
  PERSONAL = 'personal',
  FINANCE = 'finance'
}

export enum UserMood {
  TIRED = 'tired',
  NORMAL = 'normal',
  MOTIVATED = 'motivated'
}

export interface Task {
  id: string;
  userId: string;
  text: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  energyLevel: EnergyLevel;
  estimatedTime: string; // "5m", "15m", "30m", "1h", "2h+"
  createdAt: string;
  completedAt?: string;
  isAiSuggested?: boolean;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  joinedAt: string;
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  totalTasksCompleted: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DailyReflection {
  date: string;
  mood: UserMood;
  productivityScore: number; // 1-10
  whatWentWell: string;
  challenge: string;
}

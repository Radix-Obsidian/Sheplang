// Generated TypeScript types from ShepLang

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;


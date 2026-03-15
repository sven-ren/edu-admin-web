import type { User, HistoryItem } from '@/types';

const STORAGE_KEY = 'oceanClassData_v2';

export interface StorageData {
  users: Record<string, User>;
  historyStack: HistoryItem[];
}

class StorageService {
  private data: StorageData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): StorageData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error);
    }
    return { users: {}, historyStack: [] };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to storage:', error);
    }
  }

  // 用户相关
  getUsers(): Record<string, User> {
    return this.data.users;
  }

  getUser(username: string): User | null {
    return this.data.users[username] || null;
  }

  createUser(user: User): boolean {
    if (this.data.users[user.username]) {
      return false;
    }
    this.data.users[user.username] = user;
    this.saveToStorage();
    return true;
  }

  updateUser(username: string, updates: Partial<User>): boolean {
    if (!this.data.users[username]) {
      return false;
    }
    this.data.users[username] = { ...this.data.users[username], ...updates };
    this.saveToStorage();
    return true;
  }

  validateUser(username: string, password: string): boolean {
    const user = this.data.users[username];
    return user !== undefined && user.password === password;
  }

  resetPassword(username: string, newPassword: string): boolean {
    if (!this.data.users[username]) {
      return false;
    }
    this.data.users[username].password = newPassword;
    this.saveToStorage();
    return true;
  }

  // 历史记录相关
  getHistoryStack(): HistoryItem[] {
    return this.data.historyStack;
  }

  addToHistory(action: HistoryItem['action'], data: Record<string, unknown>): void {
    this.data.historyStack.push({
      action,
      data,
      timestamp: Date.now(),
    });
    // 限制历史记录数量
    if (this.data.historyStack.length > 50) {
      this.data.historyStack.shift();
    }
    this.saveToStorage();
  }

  popHistory(): HistoryItem | null {
    const item = this.data.historyStack.pop() || null;
    this.saveToStorage();
    return item;
  }

  clearHistory(): void {
    this.data.historyStack = [];
    this.saveToStorage();
  }

  // 班级数据相关
  saveClassData(username: string, classId: string, classData: User['classes'][string]): void {
    if (!this.data.users[username]) {
      return;
    }
    if (!this.data.users[username].classes) {
      this.data.users[username].classes = {};
    }
    this.data.users[username].classes[classId] = classData;
    this.saveToStorage();
  }

  // 导出/导入
  exportData(): string {
    return JSON.stringify(this.data);
  }

  importData(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.data = parsed;
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();

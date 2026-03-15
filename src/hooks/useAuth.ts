import { useState, useCallback, useEffect } from 'react';
import { storageService } from '@/services/storage';
import type { User, LoginFormData, RegisterFormData } from '@/types';

interface UseAuthReturn {
  currentUser: string | null;
  userData: User | null;
  login: (data: LoginFormData) => { success: boolean; message: string };
  register: (data: RegisterFormData) => { success: boolean; message: string };
  logout: () => void;
  resetPassword: (username: string, answer: string, newPassword: string) => { success: boolean; message: string };
  getSecurityQuestion: (username: string) => string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      setUserData(storageService.getUser(savedUser));
    }
  }, []);

  const login = useCallback((data: LoginFormData): { success: boolean; message: string } => {
    const { username, password } = data;
    
    if (!username || !password) {
      return { success: false, message: '请输入用户名和密码' };
    }

    if (!storageService.validateUser(username, password)) {
      return { success: false, message: '用户名或密码错误' };
    }

    setCurrentUser(username);
    setUserData(storageService.getUser(username));
    sessionStorage.setItem('currentUser', username);
    
    return { success: true, message: '登录成功' };
  }, []);

  const register = useCallback((data: RegisterFormData): { success: boolean; message: string } => {
    const { username, password, confirmPwd, question, answer } = data;

    if (!username || !password || !confirmPwd || !answer) {
      return { success: false, message: '请填写所有字段' };
    }

    if (username.length < 6) {
      return { success: false, message: '用户名至少6个字符' };
    }

    if (password !== confirmPwd) {
      return { success: false, message: '两次密码不一致' };
    }

    const existingUser = storageService.getUser(username);
    if (existingUser) {
      return { success: false, message: '用户名已存在' };
    }

    const newUser: User = {
      username,
      password,
      question,
      answer,
      classes: {},
    };

    if (storageService.createUser(newUser)) {
      return { success: true, message: '注册成功' };
    }

    return { success: false, message: '注册失败' };
  }, []);

  const logout = useCallback((): void => {
    setCurrentUser(null);
    setUserData(null);
    sessionStorage.removeItem('currentUser');
  }, []);

  const getSecurityQuestion = useCallback((username: string): string | null => {
    const user = storageService.getUser(username);
    return user ? user.question : null;
  }, []);

  const resetPassword = useCallback((username: string, answer: string, newPassword: string): { success: boolean; message: string } => {
    const user = storageService.getUser(username);
    
    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    if (user.answer !== answer) {
      return { success: false, message: '密保答案错误' };
    }

    if (storageService.resetPassword(username, newPassword)) {
      return { success: true, message: '密码重置成功' };
    }

    return { success: false, message: '密码重置失败' };
  }, []);

  return {
    currentUser,
    userData,
    login,
    register,
    logout,
    resetPassword,
    getSecurityQuestion,
  };
};

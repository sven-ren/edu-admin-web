import { useState, useCallback, useEffect, useRef } from 'react';
import { storageService } from '@/services/storage';
import { createDefaultClassData, createNewStudent, createNewPet } from '@/utils/helpers';
import type { ClassData, Student, Group, Reward, ActionItem, Pet } from '@/types';

interface UseClassDataReturn {
  classData: ClassData | null;
  currentClassId: string | null;
  loadClass: (username: string, classId: string) => boolean;
  createClass: (username: string, className: string) => ClassData | null;
  saveClass: (username: string) => void;
  addStudent: (name: string, groupId?: number | null) => void;
  batchAddStudents: (names: string[]) => void;
  deleteStudent: (studentId: number) => void;
  editStudent: (studentId: number, newName: string) => void;
  addGroup: (name: string, icon: string) => void;
  deleteGroup: (groupId: number) => void;
  assignStudentToGroup: (studentId: number, groupId: number | null) => void;
  addActionItem: () => void;
  removeActionItem: () => void;
  deleteActionItem: (index: number) => void;
  updateActionItem: (index: number, field: 'name' | 'points', value: string | number) => void;
  addReward: (name: string, cost: number, emoji: string) => void;
  deleteReward: (rewardId: number) => void;
  updateClassName: (name: string) => void;
  updateStageThresholds: (thresholds: number[]) => void;
  toggleGroups: () => void;
  addPet: (studentId: number, petTypeId?: string) => void;
  feedPet: (studentId: number, petIndex: number, points: number) => { success: boolean; message: string; graduated?: boolean };
  adjustPoints: (studentId: number, delta: number) => void;
  batchAdjustPoints: (groupId: number | 'all', delta: number) => void;
}

export const useClassData = (): UseClassDataReturn => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const currentUserRef = useRef<string>('');

  // 当 classData 变化时自动保存到 LocalStorage
  useEffect(() => {
    if (classData && currentClassId && currentUserRef.current) {
      storageService.saveClassData(currentUserRef.current, currentClassId, classData);
    }
  }, [classData, currentClassId]);

  const loadClass = useCallback((username: string, classId: string): boolean => {
    const user = storageService.getUser(username);
    if (!user || !user.classes[classId]) {
      return false;
    }
    currentUserRef.current = username;
    setClassData(user.classes[classId]);
    setCurrentClassId(classId);
    return true;
  }, []);

  const createClass = useCallback((username: string, className: string): ClassData | null => {
    const user = storageService.getUser(username);
    if (!user) return null;

    const newClass = createDefaultClassData(className);
    currentUserRef.current = username;
    storageService.saveClassData(username, newClass.id, newClass);
    setClassData(newClass);
    setCurrentClassId(newClass.id);
    return newClass;
  }, []);

  const saveClass = useCallback((username: string): void => {
    if (!classData || !currentClassId) return;
    storageService.saveClassData(username, currentClassId, classData);
  }, [classData, currentClassId]);

  const addStudent = useCallback((name: string, groupId?: number | null): void => {
    if (!classData) return;
    
    const newStudent = createNewStudent(name, classData.nextStudentId, classData.nextPetId, groupId);
    
    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: [...prev.students, newStudent],
        nextStudentId: prev.nextStudentId + 1,
        nextPetId: prev.nextPetId + 1,
      };
    });
  }, [classData]);

  const batchAddStudents = useCallback((names: string[]): void => {
    if (!classData) return;

    const newStudents: Student[] = [];
    let nextStudentId = classData.nextStudentId;
    let nextPetId = classData.nextPetId;

    names.forEach(name => {
      if (name.trim()) {
        newStudents.push(createNewStudent(name.trim(), nextStudentId, nextPetId));
        nextStudentId++;
        nextPetId++;
      }
    });

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: [...prev.students, ...newStudents],
        nextStudentId,
        nextPetId,
      };
    });
  }, [classData]);

  const deleteStudent = useCallback((studentId: number): void => {
    if (!classData) return;
    
    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.filter(s => s.id !== studentId),
      };
    });
  }, [classData]);

  const editStudent = useCallback((studentId: number, newName: string): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s => 
          s.id === studentId ? { ...s, name: newName } : s
        ),
      };
    });
  }, [classData]);

  const addGroup = useCallback((name: string, icon: string): void => {
    if (!classData) return;

    const newGroup: Group = {
      id: classData.nextGroupId,
      name,
      icon: icon || '⭐',
    };

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        groups: [...prev.groups, newGroup],
        nextGroupId: prev.nextGroupId + 1,
      };
    });
  }, [classData]);

  const deleteGroup = useCallback((groupId: number): void => {
    if (!classData) return;

    const hasStudents = classData.students.some(s => s.groupId === groupId);
    if (hasStudents) {
      throw new Error('请先将该组学生移动到其他组');
    }

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        groups: prev.groups.filter(g => g.id !== groupId),
      };
    });
  }, [classData]);

  const assignStudentToGroup = useCallback((studentId: number, groupId: number | null): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s => 
          s.id === studentId ? { ...s, groupId } : s
        ),
      };
    });
  }, [classData]);

  const addActionItem = useCallback((): void => {
    if (!classData) return;
    if (classData.actionItems.length >= 15) {
      throw new Error('最多只能设置15个项目');
    }

    const emojis = ['🗣️', '📝', '🤝', '👂', '⭐', '⏰', '📕', '💬', '🎤', '🧹', '✨', '🎯', '💡', '🎨', '🎵'];
    const newItem: ActionItem = {
      name: '新项目',
      points: 0,
      emoji: emojis[classData.actionItems.length % emojis.length],
    };

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        actionItems: [...prev.actionItems, newItem],
      };
    });
  }, [classData]);

  const removeActionItem = useCallback((): void => {
    if (!classData) return;
    if (classData.actionItems.length <= 1) {
      throw new Error('至少保留一个项目');
    }

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        actionItems: prev.actionItems.slice(0, -1),
      };
    });
  }, [classData]);

  const deleteActionItem = useCallback((index: number): void => {
    if (!classData) return;
    if (classData.actionItems.length <= 1) {
      throw new Error('至少保留一个项目');
    }

    setClassData(prev => {
      if (!prev) return null;
      const newItems = [...prev.actionItems];
      newItems.splice(index, 1);
      return {
        ...prev,
        actionItems: newItems,
      };
    });
  }, [classData]);

  const updateActionItem = useCallback((index: number, field: 'name' | 'points', value: string | number): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      const newItems = [...prev.actionItems];
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'points' ? Number(value) || 0 : value,
      };
      return {
        ...prev,
        actionItems: newItems,
      };
    });
  }, [classData]);

  const addReward = useCallback((name: string, cost: number, emoji: string): void => {
    if (!classData) return;

    const newReward: Reward = {
      id: classData.nextRewardId,
      name,
      cost,
      emoji: emoji || '🎁',
    };

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rewards: [...prev.rewards, newReward],
        nextRewardId: prev.nextRewardId + 1,
      };
    });
  }, [classData]);

  const deleteReward = useCallback((rewardId: number): void => {
    if (!classData) return;
    if (classData.rewards.length <= 1) {
      throw new Error('至少保留一个奖励');
    }

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        rewards: prev.rewards.filter(r => r.id !== rewardId),
      };
    });
  }, [classData]);

  const updateClassName = useCallback((name: string): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return { ...prev, name };
    });
  }, [classData]);

  const updateStageThresholds = useCallback((thresholds: number[]): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return { ...prev, stageThresholds: thresholds };
    });
  }, [classData]);

  const toggleGroups = useCallback((): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return { ...prev, groupsEnabled: !prev.groupsEnabled };
    });
  }, [classData]);

  const addPet = useCallback((studentId: number, petTypeId?: string): void => {
    if (!classData) return;

    const newPet = createNewPet(
      classData.students.find(s => s.id === studentId)?.name || '',
      classData.nextPetId,
      petTypeId
    );

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s => 
          s.id === studentId 
            ? { ...s, pets: [...s.pets, newPet] }
            : s
        ),
        nextPetId: prev.nextPetId + 1,
      };
    });
  }, [classData]);

  const feedPet = useCallback((studentId: number, petIndex: number, points: number): { success: boolean; message: string; graduated?: boolean } => {
    if (!classData) {
      return { success: false, message: '班级数据不存在' };
    }

    const student = classData.students.find(s => s.id === studentId);
    if (!student) {
      return { success: false, message: '学生不存在' };
    }

    const pet = student.pets[petIndex];
    if (!pet) {
      return { success: false, message: '宠物不存在' };
    }

    if (pet.graduated) {
      return { success: false, message: '该宠物已毕业' };
    }

    setClassData(prev => {
      if (!prev) return null;
      
      const newGrowth = pet.growth + Math.abs(points);
      let newStage = pet.stage;

      // 检查升级
      for (let i = pet.stage + 1; i < prev.stageThresholds.length; i++) {
        if (newGrowth >= prev.stageThresholds[i]) {
          newStage = i;
        }
      }

      // 检查毕业
      const isGraduated = newGrowth >= prev.stageThresholds[prev.stageThresholds.length - 1];
      
      return {
        ...prev,
        students: prev.students.map(s => {
          if (s.id !== studentId) return s;
          
          const updatedPet: Pet = {
            ...pet,
            growth: newGrowth,
            stage: isGraduated ? 4 : newStage,
            graduated: isGraduated,
          };

          const newPets = [...s.pets];
          newPets[petIndex] = updatedPet;

          return {
            ...s,
            pets: newPets,
            points: Math.max(0, s.points - 1),
            badges: isGraduated && !pet.graduated 
              ? [...(s.badges || []), '🎓']
              : (s.badges || []),
          };
        }),
      };
    });

    // 检查是否毕业或升级，返回相应消息
    const newGrowth = pet.growth + Math.abs(points);
    const isGraduated = newGrowth >= classData.stageThresholds[classData.stageThresholds.length - 1];
    
    if (isGraduated && !pet.graduated) {
      return { success: true, message: `🎉 恭喜！${pet.customName} 毕业了！获得徽章 🎓`, graduated: true };
    }

    let newStage = pet.stage;
    for (let i = pet.stage + 1; i < classData.stageThresholds.length; i++) {
      if (newGrowth >= classData.stageThresholds[i]) {
        newStage = i;
      }
    }

    if (newStage > pet.stage) {
      return { success: true, message: `✨ ${pet.customName} 升级了！` };
    }

    return { success: true, message: `🍽️ 喂食成功！+${points}成长值` };
  }, [classData]);

  const adjustPoints = useCallback((studentId: number, delta: number): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s => 
          s.id === studentId 
            ? { ...s, points: Math.max(0, s.points + delta) }
            : s
        ),
      };
    });
  }, [classData]);

  const batchAdjustPoints = useCallback((groupId: number | 'all', delta: number): void => {
    if (!classData) return;

    setClassData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        students: prev.students.map(s => {
          if (groupId === 'all' || s.groupId === groupId) {
            return { ...s, points: Math.max(0, s.points + delta) };
          }
          return s;
        }),
      };
    });
  }, [classData]);

  return {
    classData,
    currentClassId,
    loadClass,
    createClass,
    saveClass,
    addStudent,
    batchAddStudents,
    deleteStudent,
    editStudent,
    addGroup,
    deleteGroup,
    assignStudentToGroup,
    addActionItem,
    removeActionItem,
    deleteActionItem,
    updateActionItem,
    addReward,
    deleteReward,
    updateClassName,
    updateStageThresholds,
    toggleGroups,
    addPet,
    feedPet,
    adjustPoints,
    batchAdjustPoints,
  };
};

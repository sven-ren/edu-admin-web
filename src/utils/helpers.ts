import { SEA_PETS, ACTION_ITEM_EMOJIS } from '@/types';
import type { ClassData, Student, Pet, ActionItem } from '@/types';

// 生成唯一ID
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取随机宠物
export const getRandomPet = () => {
  return SEA_PETS[Math.floor(Math.random() * SEA_PETS.length)];
};

// 获取宠物当前阶段的表情或图片
export const getPetEmoji = (pet: Pet): string => {
  const petData = SEA_PETS.find(p => p.id === pet.petId);
  if (!petData) return '🥚';
  if (pet.graduated) return '🎓';
  const stage = petData.stages[pet.stage];
  // 如果是图片路径，则返回默认emoji（用于非展示场景）
  if (stage?.startsWith('/')) return '🥚';
  return stage || '🥚';
};

// 获取宠物当前阶段的展示内容（emoji或图片URL）
export const getPetStageDisplay = (pet: Pet): { type: 'emoji' | 'image'; value: string } => {
  const petData = SEA_PETS.find(p => p.id === pet.petId);
  if (!petData) return { type: 'emoji', value: '🥚' };
  if (pet.graduated) return { type: 'emoji', value: '🎓' };
  const stage = petData.stages[pet.stage];
  if (stage?.startsWith('/')) {
    return { type: 'image', value: stage };
  }
  return { type: 'emoji', value: stage || '🥚' };
};

// 获取宠物成长进度百分比
export const getPetProgress = (pet: Pet, thresholds: number[]): number => {
  if (pet.graduated) return 100;
  const maxThreshold = thresholds[thresholds.length - 1];
  return Math.min((pet.growth / maxThreshold) * 100, 100);
};

// 检查宠物是否可以升级
export const checkPetUpgrade = (pet: Pet, thresholds: number[]): { 
  canUpgrade: boolean; 
  newStage: number;
  isGraduated: boolean;
} => {
  let newStage = pet.stage;
  
  for (let i = pet.stage + 1; i < thresholds.length; i++) {
    if (pet.growth >= thresholds[i]) {
      newStage = i;
    }
  }
  
  const isGraduated = pet.growth >= thresholds[thresholds.length - 1];
  
  return {
    canUpgrade: newStage > pet.stage || (isGraduated && !pet.graduated),
    newStage,
    isGraduated,
  };
};

// 获取分组中的学生数量
export const getGroupStudentCount = (students: Student[], groupId: number): number => {
  return students.filter(s => s.groupId === groupId).length;
};

// 格式化时间
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 创建默认班级数据
export const createDefaultClassData = (className: string): ClassData => {
  return {
    id: generateId('class'),
    name: className,
    stageThresholds: [10, 20, 30, 40, 50],
    actionItems: [
      { name: '上课回答问题', points: 5, emoji: '🗣️' },
      { name: '按时交作业', points: 3, emoji: '📝' },
      { name: '帮助同学', points: 2, emoji: '🤝' },
      { name: '课堂纪律好', points: 2, emoji: '👂' },
      { name: '作业优秀', points: 5, emoji: '⭐' },
      { name: '迟到', points: -2, emoji: '⏰' },
      { name: '未交作业', points: -3, emoji: '📕' },
      { name: '课堂讲话', points: -1, emoji: '💬' },
    ],
    groups: [
      { id: 1, name: '海洋之星组', icon: '⭐' },
      { id: 2, name: '深海探险组', icon: '🌊' },
    ],
    groupsEnabled: true,
    rewards: [
      { id: 1, name: '小零食', emoji: '🍪', cost: 30 },
      { id: 2, name: '免一次作业', emoji: '📝❌', cost: 50 },
      { id: 3, name: '和老师午餐', emoji: '🍱', cost: 80 },
      { id: 4, name: '当一天班长', emoji: '👑', cost: 100 },
    ],
    students: [],
    nextStudentId: 1,
    nextGroupId: 3,
    nextRewardId: 5,
    nextPetId: 1,
  };
};

// 创建新学生
export const createNewStudent = (
  name: string, 
  studentId: number, 
  petId: number,
  groupId: number | null = null
): Student => {
  const randomPet = getRandomPet();
  return {
    id: studentId,
    name: name.trim(),
    groupId,
    avatar: randomPet.stages[0],
    points: 0,
    badges: [],
    availableBadges: 0,
    pets: [{
      id: petId,
      petId: randomPet.id,
      name: randomPet.name,
      customName: `${name.trim()}的${randomPet.name}`,
      growth: 0,
      stage: 0,
      graduated: false,
    }],
  };
};

// 创建新宠物
export const createNewPet = (studentName: string, petId: number, petTypeId?: string): Pet => {
  const petData = petTypeId 
    ? SEA_PETS.find(p => p.id === petTypeId) 
    : getRandomPet();
  if (!petData) {
    throw new Error(`无效的宠物类型: ${petTypeId}`);
  }
  return {
    id: petId,
    petId: petData.id,
    name: petData.name,
    customName: `${studentName}的${petData.name}`,
    growth: 0,
    stage: 0,
    graduated: false,
  };
};

// 获取下一个可用的表情（用于新项目）
export const getNextEmoji = (items: ActionItem[]): string => {
  return ACTION_ITEM_EMOJIS[items.length % ACTION_ITEM_EMOJIS.length];
};

// 验证班级数据
export const validateClassData = (data: Partial<ClassData>): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('班级名称不能为空');
  }
  
  if (!data.stageThresholds || data.stageThresholds.length !== 5) {
    errors.push('成长阶段配置不完整');
  }
  
  if (!data.actionItems || data.actionItems.length === 0) {
    errors.push('至少需要设置一个加分/扣分项目');
  }
  
  if (data.groupsEnabled && (!data.groups || data.groups.length === 0)) {
    errors.push('启用分组功能时至少需要有一个分组');
  }
  
  return errors;
};

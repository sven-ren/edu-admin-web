// ==================== 用户相关 ====================
export interface User {
  username: string;
  password: string;
  question: string;
  answer: string;
  classes: Record<string, ClassData>;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  password: string;
  confirmPwd: string;
  question: string;
  answer: string;
}

// ==================== 宠物相关 ====================
export interface SeaPet {
  id: string;
  name: string;
  stages: string[]; // emoji 数组或图片路径数组
  type?: "emoji" | "image"; // 宠物展示类型
}

export interface Pet {
  id: number;
  petId: string;
  name: string;
  customName: string;
  growth: number;
  stage: number;
  graduated: boolean;
}

// ==================== 学生相关 ====================
export interface Student {
  id: number;
  name: string;
  groupId: number | null;
  avatar: string;
  points: number;
  badges: string[]; // 累计获得的所有徽章（用于排行榜）
  availableBadges: number; // 可用徽章数量（用于兑换奖励）
  pets: Pet[];
}

// ==================== 班级相关 ====================
export interface ActionItem {
  name: string;
  points: number;
  emoji: string;
}

export interface Group {
  id: number;
  name: string;
  icon: string;
}

export interface Reward {
  id: number;
  name: string;
  emoji: string;
  cost: number;
}

export interface ClassData {
  id: string;
  name: string;
  stageThresholds: number[];
  actionItems: ActionItem[];
  groups: Group[];
  groupsEnabled: boolean;
  rewards: Reward[];
  students: Student[];
  nextStudentId: number;
  nextGroupId: number;
  nextRewardId: number;
  nextPetId: number;
}

// ==================== 历史记录 ====================
export type HistoryActionType = "points" | "feed" | "batchPoints" | "buy";

export interface HistoryItem {
  action: HistoryActionType;
  data: Record<string, unknown>;
  timestamp: number;
}

// ==================== 应用状态 ====================
export interface AppState {
  currentUser: string | null;
  currentClass: string | null;
  historyStack: HistoryItem[];
}

// ==================== 常量 ====================
export const SEA_PETS: SeaPet[] = [
  { id: "clownfish", name: "小丑鱼", stages: ["🥚", "🐣", "🐟", "🐠", "🎓"] },
  {
    id: "dolphin",
    name: "海豚",
    stages: [
      "/src/imgs/dolphin1.jpg",
      "/src/imgs/dolphin2.jpg",
      "/src/imgs/dolphin3.jpg",
      "/src/imgs/dolphin4.jpg",
      "/src/imgs/dolphin5.jpg",
    ],
    type: "image",
  },
  { id: "turtle", name: "海龟", stages: ["🥚", "🐢", "🐢🌊", "🐢✨", "🎓"] },
  { id: "octopus", name: "章鱼", stages: ["🥚", "🐙", "🐙🌟", "🐙✨", "🎓"] },
  { id: "seahorse", name: "海马", stages: ["🥚", "🪼", "🪼🌿", "🪼✨", "🎓"] },
  { id: "whale", name: "鲸鱼", stages: ["🥚", "🐋", "🐋💦", "🐋✨", "🎓"] },
  {
    id: "jellyfish",
    name: "水母",
    stages: [
      "/src/imgs/jellyfish1.jpg",
      "/src/imgs/jellyfish2.jpg",
      "/src/imgs/jellyfish3.jpg",
      "/src/imgs/jellyfish4.jpg",
      "/src/imgs/jellyfish5.jpg",
    ],
    type: "image",
  },
  {
    id: "shark",
    name: "鲨鱼",
    stages: [
      "/src/imgs/dolphin1.jpg",
      "/src/imgs/dolphin2.jpg",
      "/src/imgs/dolphin3.jpg",
      "/src/imgs/dolphin4.jpg",
      "/src/imgs/dolphin5.jpg",
    ],
    type: "image",
  },
];

export const DEFAULT_STAGE_THRESHOLDS = [10, 20, 30, 40, 50];

export const DEFAULT_ACTION_ITEMS: ActionItem[] = [
  { name: "上课回答问题", points: 5, emoji: "🗣️" },
  { name: "按时交作业", points: 3, emoji: "📝" },
  { name: "帮助同学", points: 2, emoji: "🤝" },
  { name: "课堂纪律好", points: 2, emoji: "👂" },
  { name: "作业优秀", points: 5, emoji: "⭐" },
  { name: "迟到", points: -2, emoji: "⏰" },
  { name: "未交作业", points: -3, emoji: "📕" },
  { name: "课堂讲话", points: -1, emoji: "💬" },
];

export const DEFAULT_GROUPS: Group[] = [
  { id: 1, name: "海洋之星组", icon: "⭐" },
  { id: 2, name: "深海探险组", icon: "🌊" },
];

export const DEFAULT_REWARDS: Reward[] = [
  { id: 1, name: "小零食", emoji: "🍪", cost: 30 },
  { id: 2, name: "免一次作业", emoji: "📝❌", cost: 50 },
  { id: 3, name: "和老师午餐", emoji: "🍱", cost: 80 },
  { id: 4, name: "当一天班长", emoji: "👑", cost: 100 },
];

export const ACTION_ITEM_EMOJIS = [
  "🗣️",
  "📝",
  "🤝",
  "👂",
  "⭐",
  "⏰",
  "📕",
  "💬",
  "🎤",
  "🧹",
  "✨",
  "🎯",
  "💡",
  "🎨",
  "🎵",
];

export const STAGE_NAMES = ["蛋", "孵化", "幼年", "青年", "毕业"];

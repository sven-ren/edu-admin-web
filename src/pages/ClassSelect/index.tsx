import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Empty, Modal, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { storageService } from '@/services/storage';
import type { ClassData } from '@/types';
import styles from './style.module.scss';

interface ClassSelectProps {
  currentUser: string;
}

const ClassSelect = ({ currentUser }: ClassSelectProps) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Record<string, ClassData>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    loadClasses();
  }, [currentUser, navigate]);

  const loadClasses = () => {
    const user = storageService.getUser(currentUser);
    if (user) {
      setClasses(user.classes || {});
    }
  };

  const handleCreateClass = () => {
    if (!newClassName.trim()) {
      message.error('请输入班级名称');
      return;
    }

    setLoading(true);
    const user = storageService.getUser(currentUser);
    if (!user) {
      message.error('用户不存在');
      setLoading(false);
      return;
    }

    const classId = `class_${Date.now()}`;
    const newClass: ClassData = {
      id: classId,
      name: newClassName.trim(),
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

    if (!user.classes) {
      user.classes = {};
    }
    user.classes[classId] = newClass;
    storageService.updateUser(currentUser, { classes: user.classes });

    setIsModalOpen(false);
    setNewClassName('');
    setLoading(false);
    loadClasses();
    message.success('班级创建成功');
  };

  const handleSelectClass = (classId: string) => {
    const classData = classes[classId];
    if (classData.students.length === 0) {
      // 如果是新班级，进入设置页面
      navigate('/setup', { state: { classId } });
    } else {
      // 否则进入主页面
      navigate('/dashboard', { state: { classId } });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>🌊 我的班级</h1>
          <p>请选择要管理的班级</p>
        </div>

        <div className={styles.classGrid}>
          {Object.keys(classes).length === 0 ? (
            <div className={styles.emptyWrapper}>
              <Empty description="暂无班级，请先创建" />
            </div>
          ) : (
            Object.entries(classes).map(([classId, cls]) => (
              <Card
                key={classId}
                className={styles.classCard}
                hoverable
                onClick={() => handleSelectClass(classId)}
              >
                <div className={styles.classIcon}>🐋</div>
                <div className={styles.className}>{cls.name}</div>
                <div className={styles.classStats}>{cls.students?.length || 0}名学生</div>
              </Card>
            ))
          )}
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className={styles.createBtn}
          onClick={() => setIsModalOpen(true)}
        >
          创建新班级
        </Button>
      </div>

      <Modal
        title="创建新班级"
        open={isModalOpen}
        onOk={handleCreateClass}
        onCancel={() => {
          setIsModalOpen(false);
          setNewClassName('');
        }}
        confirmLoading={loading}
      >
        <Input
          placeholder="请输入班级名称，例如：三（2）班"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          size="large"
        />
      </Modal>
    </div>
  );
};

export default ClassSelect;

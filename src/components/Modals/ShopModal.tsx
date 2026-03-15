import { Modal, Select, Card, message } from 'antd';
import { useState } from 'react';
import type { Student, Reward } from '@/types';
import styles from './style.module.scss';

const { Option } = Select;

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
  students: Student[];
  rewards: Reward[];
  onBuy: (studentId: number, rewardCost: number) => boolean;
}

const ShopModal = ({ visible, onClose, students, rewards, onBuy }: ShopModalProps) => {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const handleBuy = (reward: Reward) => {
    if (!selectedStudent) {
      message.error('请选择学生');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    const availableCount = student.availableBadges || 0;
    if (availableCount < reward.cost) {
      message.error(`${student.name}徽章不足，需要${reward.cost}个徽章`);
      return;
    }

    const success = onBuy(selectedStudent, reward.cost);
    if (success) {
      message.success(`${student.name} 兑换了 ${reward.name}`);
      onClose();
    } else {
      message.error('兑换失败，请重试');
    }
  };

  return (
    <Modal
      title="🏪 听海小铺"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Select
        className={styles.studentSelect}
        placeholder="选择学生"
        onChange={(value) => setSelectedStudent(value)}
        value={selectedStudent}
      >
        {students.map(s => (
          <Option key={s.id} value={s.id}>
            {s.name} ({s.points}积分, {s.availableBadges || 0}徽章)
          </Option>
        ))}
      </Select>

      <div className={styles.rewardsGrid}>
        {rewards.map(reward => (
          <Card
            key={reward.id}
            className={styles.rewardCard}
            hoverable
            onClick={() => handleBuy(reward)}
          >
            <div className={styles.rewardEmoji}>{reward.emoji}</div>
            <div className={styles.rewardInfo}>
              <div className={styles.rewardName}>{reward.name}</div>
              <div className={styles.rewardCost}>{reward.cost} 徽章</div>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
};

export default ShopModal;

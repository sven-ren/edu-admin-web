import { Modal } from 'antd';
import type { Student } from '@/types';
import styles from './style.module.scss';

interface RankingModalProps {
  visible: boolean;
  onClose: () => void;
  students: Student[];
}

const RankingModal = ({ visible, onClose, students }: RankingModalProps) => {
  const ranking = students
    .map(s => ({
      name: s.name,
      badgeCount: s.badges?.length || 0,
      badges: s.badges || [],
    }))
    .sort((a, b) => b.badgeCount - a.badgeCount);

  const getRankClass = (index: number): string => {
    if (index === 0) return styles.gold;
    if (index === 1) return styles.silver;
    if (index === 2) return styles.bronze;
    return '';
  };

  return (
    <Modal
      title="⭐ 海洋之星 · 徽章排行榜"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className={styles.rankingList}>
        {ranking.length === 0 ? (
          <div className={styles.empty}>暂无数据</div>
        ) : (
          ranking.map((item, index) => (
            <div key={item.name} className={styles.rankingItem}>
              <div className={`${styles.rankingRank} ${getRankClass(index)}`}>
                {index + 1}
              </div>
              <div className={styles.rankingInfo}>
                <div className={styles.rankingName}>{item.name}</div>
                <div className={styles.rankingBadges}>
                  {item.badges.map((badge, i) => (
                    <span key={i} className={styles.badge}>{badge}</span>
                  ))}
                </div>
              </div>
              <div className={styles.rankingCount}>{item.badgeCount} 徽章</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default RankingModal;

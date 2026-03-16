import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Card, Tag, message, Space, Badge, Modal, Radio, Avatar } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { storageService } from '@/services/storage';
import { useClassData } from '@/hooks/useClassData';
import Header from '@/components/Header';
import ShopModal from '@/components/Modals/ShopModal';
import RankingModal from '@/components/Modals/RankingModal';
import { getPetProgress, getPetStageDisplay } from '@/utils/helpers';

import type { Student, Pet } from '@/types';
import styles from './style.module.scss';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = location.state || {};
  
  const {
    classData,
    loadClass,
    saveClass,
    feedPet,
    adjustPoints,
    batchAdjustPoints,
    addPet,
    redeemReward,
    getAllPets,
  } = useClassData();

  const [currentGroupId, setCurrentGroupId] = useState<number | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [shopVisible, setShopVisible] = useState(false);
  const [rankingVisible, setRankingVisible] = useState(false);
  const [batchPoints, setBatchPoints] = useState(5);
  
  // 选择宠物弹窗状态
  const [selectPetModalVisible, setSelectPetModalVisible] = useState(false);
  const [selectedPetType, setSelectedPetType] = useState<string>('');
  const [adoptingStudentId, setAdoptingStudentId] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser || !classId) {
      navigate('/');
      return;
    }
    loadClass(currentUser, classId);
  }, [currentUser, classId, navigate, loadClass]);

  useEffect(() => {
    if (classData?.students.length && !selectedStudentId) {
      setSelectedStudentId(classData.students[0].id);
    }
  }, [classData, selectedStudentId]);

  const stats = useMemo(() => {
    if (!classData) return { eggs: 0, juvenile: 0, graduate: 0, totalPoints: 0 };
    
    let eggs = 0, juvenile = 0, graduate = 0, totalPoints = 0;
    
    classData.students.forEach(s => {
      totalPoints += s.points;
      s.pets.forEach(p => {
        if (p.graduated) graduate++;
        else if (p.stage === 0) eggs++;
        else juvenile++;
      });
    });
    
    return { eggs, juvenile, graduate, totalPoints };
  }, [classData]);

  const filteredStudents = useMemo(() => {
    if (!classData) return [];
    let students = classData.students;
    
    if (searchKeyword) {
      students = students.filter(s => s.name.includes(searchKeyword));
    }
    
    if (currentGroupId !== 'all' && classData.groupsEnabled) {
      students = students.filter(s => s.groupId === currentGroupId);
    }
    
    return students;
  }, [classData, searchKeyword, currentGroupId]);

  const selectedStudent = useMemo(() => {
    return classData?.students.find(s => s.id === selectedStudentId) || null;
  }, [classData, selectedStudentId]);

  const handleFeedPet = (studentId: number, petIndex: number, points: number) => {
    const result = feedPet(studentId, petIndex, points);
    if (result.success) {
      message.success(result.message);
      saveClass(currentUser);
    } else {
      message.error(result.message);
    }
  };

  const handleAdjustPoints = (studentId: number, delta: number) => {
    adjustPoints(studentId, delta);
    saveClass(currentUser);
    message.success(`${delta > 0 ? '+' : ''}${delta}积分`);
  };

  const handleBatchAdjust = (type: 'plus' | 'minus') => {
    const delta = type === 'plus' ? batchPoints : -batchPoints;
    batchAdjustPoints(currentGroupId, delta);
    saveClass(currentUser);
    message.success(`${type === 'plus' ? '+' : '-'}${batchPoints} 积分`);
  };

  const handleAddNewPet = (studentId: number) => {
    setAdoptingStudentId(studentId);
    const allPets = getAllPets();
    if (allPets.length > 0) {
      setSelectedPetType(allPets[0].id);
    }
    setSelectPetModalVisible(true);
  };

  const handleConfirmAdoptPet = () => {
    if (!adoptingStudentId || !selectedPetType) return;
    
    const petData = getAllPets().find(p => p.id === selectedPetType);
    addPet(adoptingStudentId, selectedPetType);
    saveClass(currentUser);
    message.success(`成功领养 ${petData?.name}！`);
    
    setSelectPetModalVisible(false);
    setAdoptingStudentId(null);
    setSelectedPetType('');
  };

  const handleUndo = () => {
    const lastAction = storageService.popHistory();
    if (!lastAction) {
      message.info('没有可撤回的操作');
      return;
    }
    
    // 恢复数据逻辑
    message.success('已撤回上一次操作');
    loadClass(currentUser, classId);
  };

  if (!classData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Header
        username={currentUser}
        className={classData.name}
        onSwitchClass={() => navigate('/classes')}
        onLogout={onLogout}
      />

      <div className={styles.main}>
        {/* 欢迎卡片 */}
        <Card className={styles.welcomeCard}>
          <div className={styles.welcomeLeft}>
            <div className={styles.welcomeIcon}>🌊</div>
            <div>
              <h2>欢迎回来，{currentUser}</h2>
              <p>{classData.name} · {classData.students.length}名学生</p>
            </div>
          </div>
        </Card>

        {/* 批量操作栏 */}
        <Card className={styles.batchBar}>
          <div className={styles.groupTabs}>
            <Tag
              className={`${styles.groupTab} ${currentGroupId === 'all' ? styles.active : ''}`}
              onClick={() => setCurrentGroupId('all')}
            >
              👥 全部学生 ({classData.students.length})
            </Tag>
            {classData.groupsEnabled && classData.groups.map(group => (
              <Tag
                key={group.id}
                className={`${styles.groupTab} ${currentGroupId === group.id ? styles.active : ''}`}
                onClick={() => setCurrentGroupId(group.id)}
              >
                {group.icon} {group.name} ({classData.students.filter(s => s.groupId === group.id).length})
              </Tag>
            ))}
          </div>
          
          <Space className={styles.batchActions}>
            <Input
              type="number"
              value={batchPoints}
              onChange={(e) => setBatchPoints(parseInt(e.target.value) || 5)}
              style={{ width: 60 }}
              min={1}
            />
            <Button type="primary" className={styles.plusBtn} onClick={() => handleBatchAdjust('plus')}>
              + 批量加分
            </Button>
            <Button type="primary" danger onClick={() => handleBatchAdjust('minus')}>
              - 批量减分
            </Button>
          </Space>
        </Card>

        {/* 主内容区 */}
        <div className={styles.mainContent}>
          {/* 学生列表 */}
          <Card className={styles.studentPanel} title={<><span>📋</span> 班级学生</>}>
            <Input.Search
              placeholder="搜索学生姓名..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
            
            <div className={styles.studentList}>
              {filteredStudents.length === 0 ? (
                <div className={styles.empty}>暂无学生</div>
              ) : (
                classData.groupsEnabled && currentGroupId === 'all' && classData.groups.length > 0 ? (
                  // 按分组显示
                  <>
                    {classData.groups.map(group => {
                      const groupStudents = filteredStudents.filter(s => s.groupId === group.id);
                      if (groupStudents.length === 0) return null;
                      
                      return (
                        <div key={group.id} className={styles.groupSection}>
                          <div className={styles.groupHeader}>
                            <span>{group.icon} {group.name} ({groupStudents.length}人)</span>
                            <Space>
                              <Button size="small" onClick={() => { setCurrentGroupId(group.id); handleBatchAdjust('plus'); }}>+5</Button>
                              <Button size="small" danger onClick={() => { setCurrentGroupId(group.id); handleBatchAdjust('minus'); }}>-5</Button>
                            </Space>
                          </div>
                          {groupStudents.map(student => (
                            <StudentItem
                              key={student.id}
                              student={student}
                              isSelected={student.id === selectedStudentId}
                              onClick={() => setSelectedStudentId(student.id)}
                            />
                          ))}
                        </div>
                      );
                    })}
                    {/* 显示未分组的学生 */}
                    {(() => {
                      const ungroupedStudents = filteredStudents.filter(s => s.groupId === null);
                      if (ungroupedStudents.length === 0) return null;
                      return (
                        <div className={styles.groupSection}>
                          <div className={styles.groupHeader}>
                            <span>👤 未分组 ({ungroupedStudents.length}人)</span>
                          </div>
                          {ungroupedStudents.map(student => (
                            <StudentItem
                              key={student.id}
                              student={student}
                              isSelected={student.id === selectedStudentId}
                              onClick={() => setSelectedStudentId(student.id)}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  // 平铺显示
                  filteredStudents.map(student => (
                    <StudentItem
                      key={student.id}
                      student={student}
                      isSelected={student.id === selectedStudentId}
                      onClick={() => setSelectedStudentId(student.id)}
                    />
                  ))
                )
              )}
            </div>
          </Card>

          {/* 宠物详情 */}
          <Card className={styles.petPanel}>
            {selectedStudent ? (
              <>
                <div className={styles.studentHeader}>
                  <div className={styles.studentInfo}>
                    <Avatar size={60} style={{ backgroundColor: '#1677ff', flexShrink: 0 }}>
                      {selectedStudent.name.charAt(0)}
                    </Avatar>
                    <div>
                      <h2>
                        {selectedStudent.name}
                        {selectedStudent.badges?.map((b, i) => (
                          <span key={i} className={styles.badge}>{b}</span>
                        ))}
                      </h2>
                      <p>积分: {selectedStudent.points} · 可用徽章: {selectedStudent.availableBadges || 0} · 宠物: {selectedStudent.pets.length}只 · 毕业: {selectedStudent.pets.filter(p => p.graduated).length}只</p>
                    </div>
                  </div>
                  <div className={styles.pointsBox}>
                    <div className={styles.label}>当前积分</div>
                    <div className={styles.value}>{selectedStudent.points}</div>
                    <Space className={styles.pointsActions}>
                      <Button size="small" type="primary" onClick={() => handleAdjustPoints(selectedStudent.id, 5)}>+5</Button>
                      <Button size="small" danger onClick={() => handleAdjustPoints(selectedStudent.id, -5)}>-5</Button>
                    </Space>
                  </div>
                </div>

                <div className={styles.aquarium}>
                  <div className={styles.aquariumHeader}>
                    <h3>🐟 {selectedStudent.name}的海族馆</h3>
                    {selectedStudent.pets.every(p => p.graduated) && (
                      <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddNewPet(selectedStudent.id)}>
                        领养新宠物
                      </Button>
                    )}
                  </div>
                  
                  <div className={styles.petsGrid}>
                    {selectedStudent.pets.map((pet, index) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        thresholds={classData.stageThresholds}
                        actionItems={classData.actionItems}
                        onFeed={(points) => handleFeedPet(selectedStudent.id, index, points)}
                        allPets={getAllPets()}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.selectTip}>👈 从左侧选择一个学生</div>
            )}
          </Card>
        </div>

        {/* 统计卡片 */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>🥚</div>
            <div>
              <h3>{stats.eggs}</h3>
              <p>待孵化</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>🐟</div>
            <div>
              <h3>{stats.juvenile}</h3>
              <p>成长中</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>🎓</div>
            <div>
              <h3>{stats.graduate}</h3>
              <p>毕业宠物</p>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>🪙</div>
            <div>
              <h3>{stats.totalPoints}</h3>
              <p>总积分</p>
            </div>
          </Card>
        </div>

        {/* 底部导航 */}
        <div className={styles.bottomNav}>
          <Button className={styles.navItem} onClick={() => setShopVisible(true)}>
            <span>🏪</span>
            <span>听海小铺</span>
          </Button>
          <Button className={styles.navItem} onClick={() => setRankingVisible(true)}>
            <span>⭐</span>
            <span>海洋之星</span>
          </Button>
          <Button className={styles.navItem} onClick={handleUndo}>
            <span>↩️</span>
            <span>撤回</span>
          </Button>
          <Button className={styles.navItem} onClick={() => navigate('/setup', { state: { classId } })}>
            <span>⚙️</span>
            <span>设置</span>
          </Button>
        </div>
      </div>

      <ShopModal
        visible={shopVisible}
        onClose={() => setShopVisible(false)}
        students={classData.students}
        rewards={classData.rewards}
        onBuy={(studentId, rewardCost) => {
          const success = redeemReward(studentId, rewardCost);
          if (success) {
            saveClass(currentUser);
          }
          return success;
        }}
      />

      <RankingModal
        visible={rankingVisible}
        onClose={() => setRankingVisible(false)}
        students={classData.students}
      />

      {/* 选择宠物弹窗 */}
      <Modal
        title="🐠 选择要领养的宠物"
        open={selectPetModalVisible}
        onOk={handleConfirmAdoptPet}
        onCancel={() => {
          setSelectPetModalVisible(false);
          setAdoptingStudentId(null);
          setSelectedPetType('');
        }}
        okText="领养"
        cancelText="取消"
      >
        <Radio.Group 
          value={selectedPetType} 
          onChange={(e) => setSelectedPetType(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {getAllPets().map(pet => {
              const stageValue = pet.stages[1];
              const isImage = stageValue.startsWith('/') || stageValue.startsWith('data:image');
              return (
                <Radio key={pet.id} value={pet.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  {isImage ? (
                    <img 
                      src={stageValue} 
                      alt={pet.name} 
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', marginRight: '12px' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>{stageValue}</span>
                  )}
                  <span style={{ fontWeight: 500 }}>{pet.name}</span>
                </Radio>
              );
            })}
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  );
};

// 学生列表项组件
interface StudentItemProps {
  student: Student;
  isSelected: boolean;
  onClick: () => void;
}

const StudentItem = ({ student, isSelected, onClick }: StudentItemProps) => {
  const graduatedCount = student.pets.filter(p => p.graduated).length;
  
  return (
    <div
      className={`${styles.studentItem} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <Avatar size={36} style={{ marginRight: 12, backgroundColor: '#1677ff', flexShrink: 0 }}>
        {student.name.charAt(0)}
      </Avatar>
      <div className={styles.studentDetail}>
        <div className={styles.studentNameRow}>
          <span className={styles.studentName}>{student.name}</span>
          <span className={styles.petCount}>{student.pets.length}只</span>
          {graduatedCount > 0 && <Badge count={`🎓${graduatedCount}`} style={{ backgroundColor: '#ffd700', color: '#333' }} />}
        </div>
      </div>
      <div className={styles.studentPoints}>{student.points}</div>
    </div>
  );
};

// 宠物卡片组件
interface PetCardProps {
  pet: Pet;
  thresholds: number[];
  actionItems: { name: string; points: number; emoji: string }[];
  onFeed: (points: number) => void;
}

const PetCard = ({ pet, thresholds, actionItems, onFeed, allPets }: PetCardProps & { allPets: import('@/types').SeaPet[] }) => {
  const petData = allPets.find(p => p.id === pet.petId);
  const progress = getPetProgress(pet, thresholds);
  const stageDisplay = getPetStageDisplay(pet, allPets);
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  
  // 根据阶段获取动画类名
  const getAnimationClass = () => {
    if (pet.graduated) return styles.petGraduated;
    return styles[`petStage${pet.stage}` as keyof typeof styles] || '';
  };
  
  // 计算等级（1-5）
  const level = pet.graduated ? 5 : pet.stage + 1;

  const handleFeedClick = (points: number) => {
    onFeed(points);
    setFeedModalVisible(false);
  };
  
  return (
    <>
      <div className={`${styles.petCard} ${pet.graduated ? styles.graduated : ''}`}>
        {/* 等级标签 - 左上角 */}
        <div className={styles.levelBadge}>Lv{level}</div>
        
        {pet.graduated && <div className={styles.graduatedBadge}>🎓 毕业</div>}
        
        {/* 宠物展示区 - 居中且更大 */}
        <div className={styles.petDisplay}>
          {stageDisplay.type === 'image' ? (
            <img 
              src={stageDisplay.value} 
              alt={petData?.name} 
              className={`${styles.petImageLarge} ${getAnimationClass()}`}
            />
          ) : (
            <span className={`${styles.petEmojiLarge} ${getAnimationClass()}`}>{stageDisplay.value}</span>
          )}
        </div>
        
        <div className={styles.petInfo}>
          <div className={styles.petName}>{pet.customName}</div>
          <div className={styles.petSpecies}>{petData?.name}</div>
        </div>
        
        <div className={styles.growthBar}>
          <div className={styles.progress}>
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.growthInfo}>
            <span>成长值: {pet.growth}</span>
            <span>{pet.graduated ? '已毕业' : `下一级: ${thresholds[Math.min(pet.stage + 1, 4)]}`}</span>
          </div>
        </div>
        
        {!pet.graduated && (
          <Button className={styles.feedBtn} onClick={() => setFeedModalVisible(true)}>
            🍽️ 喂食
          </Button>
        )}
      </div>

      {/* 喂食弹窗 */}
      <Modal
        title={`🍽️ 喂食 ${pet.customName}`}
        open={feedModalVisible}
        onCancel={() => setFeedModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className={styles.feedModalContent}>
          <p className={styles.feedModalTip}>选择行为调整宠物成长值：</p>
          <div className={styles.feedOptions}>
            {actionItems.map((item, index) => (
              <div
                key={index}
                className={styles.feedOption}
                onClick={() => handleFeedClick(item.points)}
              >
                <span className={styles.feedOptionEmoji}>{item.emoji}</span>
                <span className={styles.feedOptionName}>{item.name}</span>
                <span className={`${styles.feedOptionPoints} ${item.points > 0 ? styles.positive : styles.negative}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;

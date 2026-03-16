import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Card, Switch, Table, message, Space, Typography, Modal, Radio, Select, Upload, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';

import { useClassData } from '@/hooks/useClassData';
import { fileToBase64 } from '@/utils/helpers';
import type { SeaPet } from '@/types';
import styles from './style.module.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SetupProps {
  currentUser: string;
}

const STAGE_NAMES = ['蛋阶段', '孵化阶段', '幼年阶段', '青年阶段', '毕业阶段'];

const Setup = ({ currentUser }: SetupProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = location.state || {};
  
  const {
    classData,
    loadClass,
    saveClass,
    addStudent,
    batchAddStudents,
    deleteStudent,
    editStudent,
    addGroup,
    deleteGroup,
    assignStudentToGroup,

    addActionItem,
    deleteActionItem,
    updateActionItem,
    addReward,
    deleteReward,
    updateReward,
    updateClassName,
    updateStageThresholds,
    toggleGroups,
    addCustomPet,
    updateCustomPet,
    deleteCustomPet,
    getAllPets,

  } = useClassData();

  const [batchNames, setBatchNames] = useState('');
  const [batchImportGroupId, setBatchImportGroupId] = useState<number | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGroupId, setNewStudentGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('⭐');
  const [stageInputs, setStageInputs] = useState<number[]>([10, 20, 30, 40, 50]);

  // 编辑学生弹窗状态
  const [editStudentModalVisible, setEditStudentModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{ id: number; name: string } | null>(null);
  const [editStudentName, setEditStudentName] = useState('');

  // 添加奖励弹窗状态
  const [addRewardModalVisible, setAddRewardModalVisible] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState<number>(50);
  const [newRewardEmoji, setNewRewardEmoji] = useState('🎁');

  // 编辑奖励状态
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);

  // 分配分组弹窗状态
  const [assignGroupModalVisible, setAssignGroupModalVisible] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<{ id: number; name: string; groupId: number | null } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // 宠物管理状态
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<SeaPet | null>(null);
  const [petForm, setPetForm] = useState<{
    id: string;
    name: string;
    stages: string[];
  }>({
    id: '',
    name: '',
    stages: ['', '', '', '', ''],
  });

  useEffect(() => {
    if (!currentUser || !classId) {
      navigate('/');
      return;
    }
    loadClass(currentUser, classId);
  }, [currentUser, classId, navigate, loadClass]);

  useEffect(() => {
    if (classData) {
      setStageInputs(classData.stageThresholds);
    }
  }, [classData]);

  if (!classData) {
    return null;
  }

  const handleBatchImport = () => {
    const names = batchNames.split('\n').filter(name => name.trim());
    if (names.length === 0) {
      message.error('请输入学生姓名');
      return;
    }
    batchAddStudents(names, batchImportGroupId);
    setBatchNames('');
    setBatchImportGroupId(null);
    message.success(`成功导入 ${names.length} 名学生`);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      message.error('请输入学生姓名');
      return;
    }
    addStudent(newStudentName, newStudentGroupId);
    setNewStudentName('');
    setNewStudentGroupId(null);
    message.success('学生添加成功');
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      message.error('请输入组名');
      return;
    }
    addGroup(newGroupName, newGroupIcon);
    setNewGroupName('');
    message.success('分组添加成功');
  };

  const handleSave = () => {
    updateStageThresholds(stageInputs);
    saveClass(currentUser);
    message.success('班级设置已保存');
    navigate('/dashboard', { state: { classId } });
  };

  // 打开添加宠物弹窗
  const openAddPetModal = () => {
    setEditingPet(null);
    setPetForm({
      id: `custom_${Date.now()}`,
      name: '',
      stages: ['', '', '', '', ''],
    });
    setPetModalVisible(true);
  };

  // 打开编辑宠物弹窗
  const openEditPetModal = (pet: SeaPet) => {
    setEditingPet(pet);
    setPetForm({
      id: pet.id,
      name: pet.name,
      stages: [...pet.stages],
    });
    setPetModalVisible(true);
  };

  // 处理图片上传
  const handleImageUpload = async (file: File, stageIndex: number) => {
    try {
      const base64 = await fileToBase64(file);
      const newStages = [...petForm.stages];
      newStages[stageIndex] = base64;
      setPetForm({ ...petForm, stages: newStages });
      message.success('图片上传成功');
      return false; // 阻止默认上传行为
    } catch (error) {
      message.error('图片上传失败');
      return false;
    }
  };

  // 处理使用 emoji
  const handleUseEmoji = (stageIndex: number, emoji: string) => {
    const newStages = [...petForm.stages];
    newStages[stageIndex] = emoji;
    setPetForm({ ...petForm, stages: newStages });
  };

  // 保存宠物
  const handleSavePet = () => {
    if (!petForm.name.trim()) {
      message.error('请输入宠物名称');
      return;
    }
    if (petForm.stages.some(s => !s)) {
      message.error('请为每个阶段设置图片或表情');
      return;
    }

    const pet: SeaPet = {
      id: petForm.id,
      name: petForm.name.trim(),
      stages: petForm.stages,
      type: petForm.stages[0].startsWith('data:image') ? 'image' : 'emoji',
    };

    if (editingPet) {
      updateCustomPet(editingPet.id, pet);
      message.success('宠物更新成功');
    } else {
      addCustomPet(pet);
      message.success('宠物添加成功');
    }
    setPetModalVisible(false);
  };

  // 处理删除宠物
  const handleDeletePet = (petId: string, petName: string) => {
    // 检查是否有学生正在使用这个宠物
    const isInUse = classData.students.some(s => 
      s.pets.some(p => p.petId === petId)
    );
    
    if (isInUse) {
      message.error(`无法删除 "${petName}"，有学生正在使用这个宠物`);
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除宠物 "${petName}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteCustomPet(petId);
        message.success('宠物已删除');
      },
    });
  };

  const studentColumns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '初始积分',
      dataIndex: 'points',
      key: 'points',
    },
    {
      title: '分组',
      dataIndex: 'groupId',
      key: 'groupId',
      render: (groupId: number | null) => {
        const group = classData.groups.find(g => g.id === groupId);
        return group ? `${group.icon} ${group.name}` : '未分组';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: { id: number; name: string; groupId: number | null }) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStudent(record);
              setEditStudentName(record.name);
              setEditStudentModalVisible(true);
            }}
          >
            编辑
          </Button>
          {classData.groupsEnabled && classData.groups.length > 0 && (
            <Button
              size="small"
              onClick={() => {
                setAssigningStudent(record);
                setSelectedGroupId(record.groupId);
                setAssignGroupModalVisible(true);
              }}
            >
              分配分组
            </Button>
          )}
          <Button 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
                  Modal.confirm({
                    title: '确认删除',
                    content: `确定要删除学生 "${record.name}" 吗？此操作不可恢复。`,
                    okText: '删除',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: () => {
                      deleteStudent(record.id);
                      message.success('学生已删除');
                    },
                  });
                }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 获取所有宠物（内置 + 自定义）
  const allPets = getAllPets();
  const customPets = classData.customPets || [];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Title level={2}>🌊 欢迎使用海洋班级园</Title>
          <Text type="secondary">请完成班级初始化设置</Text>
        </div>

        {/* 班级名称 */}
        <Card className={styles.section}>
          <Title level={4}>🐟 班级名称</Title>
          <Input
            value={classData.name}
            onChange={(e) => updateClassName(e.target.value)}
            placeholder="例如：三（2）班"
            size="large"
          />
        </Card>

        {/* 加分/扣分项目 */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={4}>➕➖ 加分/扣分项目配置</Title>
            <Space>
              <Button icon={<PlusOutlined />} onClick={addActionItem}>
                添加项目
              </Button>
            </Space>
          </div>
          <Text type="secondary">设置1-15个可操作的项目，正数为加分，负数为扣分</Text>
          
          <div className={styles.itemsGrid}>
            {classData.actionItems.map((item, index) => (
              <Card key={index} className={styles.itemCard} size="small">
                <div className={styles.itemIcon}>{item.emoji}</div>
                <div className={styles.itemInputs}>
                  <Input
                    value={item.name}
                    onChange={(e) => updateActionItem(index, 'name', e.target.value)}
                    placeholder="项目名称"
                    size="small"
                  />
                  <Input
                    type="number"
                    value={item.points}
                    onChange={(e) => updateActionItem(index, 'points', parseInt(e.target.value) || 0)}
                    placeholder="分值"
                    size="small"
                  />
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteActionItem(index)}
                />
              </Card>
            ))}
          </div>
        </Card>

        {/* 宠物管理 */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={4}>🐠 宠物管理</Title>
            <Button icon={<PlusOutlined />} onClick={openAddPetModal}>
              添加宠物
            </Button>
          </div>
          <Text type="secondary">自定义宠物类型，支持上传图片或使用表情符号</Text>
          
          <div className={styles.petsGrid}>
            {/* 显示所有宠物 */}
            {allPets.map((pet) => {
              const isCustom = customPets.some(cp => cp.id === pet.id);
              return (
                <Card key={pet.id} className={styles.petCard} size="small">
                  <div className={styles.petPreview}>
                    {pet.stages.map((stage, idx) => (
                      <div key={idx} className={styles.petStage}>
                        {stage.startsWith('data:image') ? (
                          <img src={stage} alt={`阶段${idx + 1}`} />
                        ) : (
                          <span className={styles.petEmoji}>{stage}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.petInfo}>
                    <div className={styles.petName}>
                      {pet.name}
                      {isCustom && <span className={styles.customTag}>自定义</span>}
                    </div>
                  </div>
                  {isCustom && (
                    <Space className={styles.petActions}>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditPetModal(pet)}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeletePet(pet.id, pet.name)}
                      />
                    </Space>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>

        {/* 成长阶段配置 */}
        <Card className={styles.section}>
          <Title level={4}>📈 成长阶段配置</Title>
          <div className={styles.stageInputs}>
            {stageInputs.map((value, index) => (
              <div key={index} className={styles.stageInput}>
                <label>{index + 1}级</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => {
                    const newInputs = [...stageInputs];
                    newInputs[index] = parseInt(e.target.value) || 0;
                    setStageInputs(newInputs);
                  }}
                  min={1}
                />
              </div>
            ))}
          </div>
          <div className={styles.tip}>
            💡 示例：阶段配置为（10,20,30,40,50）时，学生累计10份食物升到1级，累计50份食物升到5级（毕业）
          </div>
        </Card>

        {/* 学生名单 */}
        <Card className={styles.section}>
          <Title level={4}>📋 学生名单</Title>
          
          <div className={styles.batchImport}>
            <Text type="secondary">💡 批量导入：从Excel复制姓名，每行一个，点击导入</Text>
            <TextArea
              value={batchNames}
              onChange={(e) => setBatchNames(e.target.value)}
              placeholder="例如：&#10;张三&#10;李四&#10;王五"
              rows={3}
            />
            <div className={styles.batchImportRow}>
              {classData.groupsEnabled && classData.groups.length > 0 && (
                <Select
                  value={batchImportGroupId}
                  onChange={(value) => setBatchImportGroupId(value)}
                  placeholder="选择分组（可选）"
                  style={{ width: 200 }}
                  allowClear
                >
                  <Select.Option value={null}>未分组</Select.Option>
                  {classData.groups.map(group => (
                    <Select.Option key={group.id} value={group.id}>
                      {group.icon} {group.name}
                    </Select.Option>
                  ))}
                </Select>
              )}
              <Button type="primary" onClick={handleBatchImport}>
                批量导入
              </Button>
            </div>
          </div>

          <div className={styles.addStudentRow}>
            <Input
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="学生姓名"
              onPressEnter={handleAddStudent}
              style={{ flex: 1 }}
            />
            {classData.groupsEnabled && classData.groups.length > 0 && (
              <Select
                value={newStudentGroupId}
                onChange={(value) => setNewStudentGroupId(value)}
                placeholder="选择分组"
                style={{ width: 150 }}
                allowClear
              >
                <Select.Option value={null}>未分组</Select.Option>
                {classData.groups.map(group => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.icon} {group.name}
                  </Select.Option>
                ))}
              </Select>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStudent}>
              添加学生
            </Button>
          </div>

          <Table
            dataSource={classData.students}
            columns={studentColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 分组管理 */}
        <Card className={styles.section}>
          <Title level={4}>👥 分组管理</Title>
          
          <div className={styles.toggleRow}>
            <span>启用分组功能</span>
            <Switch checked={classData.groupsEnabled} onChange={toggleGroups} />
          </div>

          {classData.groupsEnabled && (
            <>
              <div className={styles.addGroupRow}>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="组名，例如：海洋之星组"
                />
                <Input
                  value={newGroupIcon}
                  onChange={(e) => setNewGroupIcon(e.target.value)}
                  placeholder="图标"
                  style={{ width: 80 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGroup}>
                  添加分组
                </Button>
              </div>

              <div className={styles.groupsList}>
                {classData.groups.map((group) => (
                  <Card key={group.id} className={styles.groupCard} size="small">
                    <span>{group.icon}</span>
                    <span>{group.name}</span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => deleteGroup(group.id)}
                    />
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* 奖励兑换设置 */}
        <Card className={styles.section}>
          <Title level={4}>🎁 奖励兑换设置</Title>
          <div className={styles.rewardsGrid}>
            {classData.rewards.map((reward) => (
              <Card key={reward.id} className={styles.rewardCard} size="small">
                <div className={`${styles.rewardEmoji} ${reward.name === '免一次作业' ? styles['font-1rem'] : ''}`}>{reward.emoji}</div>
                <div className={styles.rewardInfo}>
                  <div>{reward.name}</div>
                  <div className={styles.rewardCost}>{reward.cost} 徽章</div>
                </div>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditingRewardId(reward.id)}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteReward(reward.id)}
                  />
                </Space>
              </Card>
            ))}
            <Button
              className={styles.addRewardBtn}
              icon={<PlusOutlined />}
              onClick={() => {
                setNewRewardName('');
                setNewRewardCost(50);
                setNewRewardEmoji('🎁');
                setAddRewardModalVisible(true);
              }}
            >
              添加奖励
            </Button>
          </div>
        </Card>

        <div className={styles.actions}>
          <Button type="primary" size="large" onClick={handleSave}>
            保存并进入管理后台
          </Button>
        </div>
      </div>

      {/* 编辑学生弹窗 */}
      <Modal
        title="修改学生姓名"
        open={editStudentModalVisible}
        onOk={() => {
          if (editStudentName.trim()) {
            editStudent(editingStudent!.id, editStudentName.trim());
            setEditStudentModalVisible(false);
            setEditingStudent(null);
          } else {
            message.error('请输入学生姓名');
          }
        }}
        onCancel={() => {
          setEditStudentModalVisible(false);
          setEditingStudent(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Input
          value={editStudentName}
          onChange={(e) => setEditStudentName(e.target.value)}
          placeholder="请输入学生姓名"
          onPressEnter={() => {
            if (editStudentName.trim()) {
              editStudent(editingStudent!.id, editStudentName.trim());
              setEditStudentModalVisible(false);
              setEditingStudent(null);
            }
          }}
        />
      </Modal>

      {/* 添加奖励弹窗 */}
      <Modal
        title="添加奖励"
        open={addRewardModalVisible}
        onOk={() => {
          if (!newRewardName.trim()) {
            message.error('请输入奖励名称');
            return;
          }
          addReward(newRewardName.trim(), newRewardCost, newRewardEmoji);
          setAddRewardModalVisible(false);
          setNewRewardName('');
          setNewRewardCost(50);
          setNewRewardEmoji('🎁');
        }}
        onCancel={() => {
          setAddRewardModalVisible(false);
          setNewRewardName('');
          setNewRewardCost(50);
          setNewRewardEmoji('🎁');
        }}
        okText="添加"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>奖励名称</label>
            <Input
              value={newRewardName}
              onChange={(e) => setNewRewardName(e.target.value)}
              placeholder="例如：小零食"
            />
          </div>
          <div>
            <label>所需徽章</label>
            <Input
              type="number"
              value={newRewardCost}
              onChange={(e) => setNewRewardCost(parseInt(e.target.value) || 0)}
              placeholder="例如：50"
              min={1}
            />
          </div>
          <div>
            <label>图标</label>
            <Input
              value={newRewardEmoji}
              onChange={(e) => setNewRewardEmoji(e.target.value)}
              placeholder="例如：🎁"
              style={{ width: 80 }}
            />
          </div>
        </Space>
      </Modal>

      {/* 编辑奖励弹窗 */}
      <Modal
        title="编辑奖励"
        open={editingRewardId !== null}
        onOk={() => setEditingRewardId(null)}
        onCancel={() => setEditingRewardId(null)}
        okText="完成"
        cancelText="取消"
      >
        {(() => {
          const reward = classData.rewards.find(r => r.id === editingRewardId);
          if (!reward) return null;
          return (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <label>奖励名称</label>
                <Input
                  value={reward.name}
                  onChange={(e) => updateReward(reward.id, 'name', e.target.value)}
                  placeholder="例如：小零食"
                />
              </div>
              <div>
                <label>所需徽章</label>
                <Input
                  type="number"
                  value={reward.cost}
                  onChange={(e) => updateReward(reward.id, 'cost', parseInt(e.target.value) || 0)}
                  placeholder="例如：50"
                  min={1}
                />
              </div>
              <div>
                <label>图标</label>
                <Input
                  value={reward.emoji}
                  onChange={(e) => updateReward(reward.id, 'emoji', e.target.value)}
                  placeholder="例如：🎁"
                  style={{ width: 80 }}
                />
              </div>
            </Space>
          );
        })()}
      </Modal>

      {/* 分配分组弹窗 */}
      <Modal
        title={`分配分组 - ${assigningStudent?.name || ''}`}
        open={assignGroupModalVisible}
        onOk={() => {
          assignStudentToGroup(assigningStudent!.id, selectedGroupId);
          setAssignGroupModalVisible(false);
          setAssigningStudent(null);
          message.success('分组分配成功');
        }}
        onCancel={() => {
          setAssignGroupModalVisible(false);
          setAssigningStudent(null);
        }}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Radio.Group 
            value={selectedGroupId} 
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value={null}>👤 未分组</Radio>
              {classData.groups.map(group => (
                <Radio key={group.id} value={group.id}>
                  {group.icon} {group.name}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Space>
      </Modal>

      {/* 宠物管理弹窗 */}
      <Modal
        title={editingPet ? `编辑宠物 - ${editingPet.name}` : '添加宠物'}
        open={petModalVisible}
        onOk={handleSavePet}
        onCancel={() => setPetModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>宠物名称</label>
            <Input
              value={petForm.name}
              onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              placeholder="例如：小海豚"
            />
          </div>
          
          <div className={styles.petStagesSection}>
            <label>各阶段图片/表情</label>
            <Text type="secondary">为每个成长阶段设置展示图片或表情符号</Text>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {STAGE_NAMES.map((stageName, index) => (
                <Col span={12} key={index}>
                  <Card size="small" title={stageName}>
                    <div className={styles.stagePreview}>
                      {petForm.stages[index] ? (
                        petForm.stages[index].startsWith('data:image') ? (
                          <img 
                            src={petForm.stages[index]} 
                            alt={stageName} 
                            className={styles.stagePreviewImage}
                          />
                        ) : (
                          <span className={styles.stagePreviewEmoji}>{petForm.stages[index]}</span>
                        )
                      ) : (
                        <span className={styles.stagePlaceholder}>未设置</span>
                      )}
                    </div>
                    
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload(file, index)}
                      >
                        <Button icon={<UploadOutlined />} size="small" block>
                          上传图片
                        </Button>
                      </Upload>
                      
                      <Input
                        placeholder="或输入表情"
                        size="small"
                        value={petForm.stages[index] && !petForm.stages[index].startsWith('data:image') ? petForm.stages[index] : ''}
                        onChange={(e) => handleUseEmoji(index, e.target.value)}
                      />
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Setup;

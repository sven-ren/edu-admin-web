import { useState } from 'react';
import { Button, Input, Select, Form, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, CheckOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import styles from './style.module.scss';

const { Option } = Select;

const Login = () => {
  const { login, register, getSecurityQuestion, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  
  // 忘记密码相关状态
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotUsername, setForgotUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [forgotForm] = Form.useForm();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    const result = login(values);
    if (result.success) {
      message.success(result.message);
      setTimeout(() => { window.location.href = '/classes'; }, 500);
    } else {
      message.error(result.message);
    }
    setLoading(false);
  };

  const handleRegister = async (values: { 
    username: string; 
    password: string; 
    confirmPwd: string;
    question: string;
    answer: string;
  }) => {
    setLoading(true);
    const result = register(values);
    if (result.success) {
      message.success(result.message);
      setActiveTab('login');
    } else {
      message.error(result.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    setForgotModalVisible(true);
    setForgotStep(1);
    setForgotUsername('');
    setSecurityQuestion('');
    forgotForm.resetFields();
  };

  const handleVerifyUsername = () => {
    const username = forgotForm.getFieldValue('username');
    if (!username) {
      message.error('请输入用户名');
      return;
    }
    const question = getSecurityQuestion(username);
    if (!question) {
      message.error('用户不存在');
      return;
    }
    setForgotUsername(username);
    setSecurityQuestion(question);
    setForgotStep(2);
  };

  const handleResetPassword = () => {
    const answer = forgotForm.getFieldValue('answer');
    const newPassword = forgotForm.getFieldValue('newPassword');
    
    if (!answer || !newPassword) {
      message.error('请填写所有字段');
      return;
    }

    const result = resetPassword(forgotUsername, answer, newPassword);
    if (result.success) {
      message.success(result.message);
      setForgotModalVisible(false);
    } else {
      message.error(result.message);
    }
  };

  const securityQuestions = [
    '你的小学名字？',
    '你最喜欢的动物？',
    '你的生日？',
    '你母亲的名字？',
  ];

  return (
    <div className={styles.loginPage}>
      <div className="ocean-wave"></div>
      <div className="floating-fish fish1">🐠</div>
      <div className="floating-fish fish2">🐋</div>
      <div className="floating-fish fish3">🐡</div>

      <div className={styles.loginCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerIcon}>🐋</div>
          <h1>海洋班级园</h1>
          <div className={styles.subtitle}>让学习变得更有趣</div>
        </div>

        <div className={styles.cardBody}>
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              登录
            </div>
            <div 
              className={`tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              注册
            </div>
          </div>

          {activeTab === 'login' ? (
            <Form onFinish={handleLogin} layout="vertical" className={styles.form}>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入用户名" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入密码" 
                  size="large"
                />
              </Form.Item>

              <div className={styles.forgotRow}>
                <a onClick={handleForgotPassword}>忘记密码？使用密保找回</a>
              </div>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                className={styles.submitBtn}
              >
                立即登录
              </Button>
            </Form>
          ) : (
            <Form onFinish={handleRegister} layout="vertical" className={styles.form}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 6, message: '用户名至少6个字符' },
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名（至少6个字符）" 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入密码" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPwd"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<CheckOutlined />} 
                  placeholder="请再次输入密码" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="question"
                rules={[{ required: true, message: '请选择密保问题' }]}
                initialValue={securityQuestions[0]}
              >
                <Select size="large" placeholder="选择密保问题">
                  {securityQuestions.map(q => (
                    <Option key={q} value={q}>{q}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="answer"
                rules={[{ required: true, message: '请输入密保答案' }]}
              >
                <Input 
                  placeholder="请输入密保答案" 
                  size="large"
                />
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                className={styles.submitBtn}
              >
                立即注册
              </Button>
            </Form>
          )}
        </div>
      </div>

      {/* 忘记密码弹窗 */}
      <Modal
        title="找回密码"
        open={forgotModalVisible}
        onCancel={() => setForgotModalVisible(false)}
        footer={null}
        width={400}
      >
        {forgotStep === 1 ? (
          <Form form={forgotForm} layout="vertical">
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Button type="primary" block onClick={handleVerifyUsername}>
              下一步
            </Button>
          </Form>
        ) : (
          <Form form={forgotForm} layout="vertical">
            <Form.Item label="密保问题">
              <Input value={securityQuestion} disabled />
            </Form.Item>
            <Form.Item
              name="answer"
              label="密保答案"
              rules={[{ required: true, message: '请输入密保答案' }]}
            >
              <Input placeholder="请输入密保答案" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[{ required: true, message: '请输入新密码' }]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Button type="primary" block onClick={handleResetPassword}>
              重置密码
            </Button>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Login;

import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import styles from './style.module.scss';

interface HeaderProps {
  username: string;
  className?: string;
  onSwitchClass?: () => void;
  onLogout?: () => void;
}

const Header = ({ username, className, onSwitchClass, onLogout }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (onSwitchClass) {
      onSwitchClass();
    } else {
      navigate('/classes');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <span className={styles.logoIcon}>🐋</span>
        <span className={styles.logoText}>海洋班级园1</span>
      </div>
      
      <div className={styles.userMenu}>
        <div className={styles.userInfo}>
          <span className={styles.userAvatar}>🐟</span>
          <span className={styles.userName}>{username}</span>
        </div>
        
        {className && (
          <Button 
            className={styles.classBadge}
            onClick={onSwitchClass}
          >
            {className}
          </Button>
        )}
        
        <Button 
          className={styles.logoutBtn}
          icon={<LogoutOutlined />}
          onClick={onLogout}
        >
          退出
        </Button>
      </div>
    </header>
  );
};

export default Header;

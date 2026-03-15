import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { Login, ClassSelect, Setup, Dashboard } from '@/pages';
import './styles/global.scss';

// 主题配置
const themeConfig = {
  token: {
    colorPrimary: '#4a90e2',
    colorSuccess: '#27ae60',
    colorWarning: '#e67e22',
    colorError: '#c62828',
    borderRadius: 12,
    fontFamily: "'Segoe UI', 'Quicksand', system-ui, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 30,
      fontWeight: 600,
    },
    Card: {
      borderRadius: 20,
    },
    Input: {
      borderRadius: 12,
    },
    Select: {
      borderRadius: 12,
    },
    Modal: {
      borderRadius: 20,
    },
  },
};

function App() {
  const { currentUser, logout } = useAuth();

  return (
    <ConfigProvider theme={themeConfig}>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={currentUser ? <Navigate to="/classes" /> : <Login />} 
          />
          <Route 
            path="/classes" 
            element={currentUser ? <ClassSelect currentUser={currentUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup" 
            element={currentUser ? <Setup currentUser={currentUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/dashboard" 
            element={currentUser ? <Dashboard currentUser={currentUser} onLogout={logout} /> : <Navigate to="/" />} 
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;

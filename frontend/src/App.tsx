import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PriceListPage from './pages/PriceListPage';

const App: React.FC = () => {
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMenu = async () => {
    setLoading(true);
    setError('');
    setMenuData(null);
    try {
      const res = await fetch('http://localhost:5000/api/generate-menu');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMenuData(data);
      }
    } catch (e) {
      setError('请求后端失败，请检查服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  // 渲染菜单表格
  const renderMenuTable = () => {
    if (!menuData) return null;
    const days = Object.keys(menuData);
    return (
      <table border={1} style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            <th>日期</th>
            <th>中餐-荤菜</th>
            <th>中餐-素菜</th>
            <th>晚餐-荤菜</th>
            <th>晚餐-素菜</th>
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td>{day}</td>
              <td>{menuData[day]['中餐']?.['荤菜']}</td>
              <td>{menuData[day]['中餐']?.['素菜']}</td>
              <td>{menuData[day]['晚餐']?.['荤菜']}</td>
              <td>{menuData[day]['晚餐']?.['素菜']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={
            <div>
              <h1>什么煮糊了管理系统</h1>
              <div className="mb-6">
                <Link 
                  to="/menu" 
                  className="btn btn-primary"
                >
                  上传我的菜单
                </Link>
                <Link 
                  to="/price-list" 
                  className="btn btn-primary"
                  style={{ marginLeft: '10px' }}
                >
                  上传我的价格清单
                </Link>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: '10px' }}
                  onClick={handleGenerateMenu}
                  disabled={loading}
                >
                  {loading ? '生成中...' : '生成菜单'}
                </button>
              </div>
              {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
              {renderMenuTable()}
            </div>
          } />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/price-list" element={<PriceListPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 
import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PriceListPage from './pages/PriceListPage';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);

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

  const handleDownload = async () => {
    if (!tableRef.current) return;
    
    try {
      const canvas = await html2canvas(tableRef.current, {
        background: '#ffffff',
        logging: false,
        useCORS: true,
        width: tableRef.current.offsetWidth * 2,
        height: tableRef.current.offsetHeight * 2,
      });
      
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `每周菜单_${new Date().toLocaleDateString()}.jpg`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载失败，请重试');
    }
  };

  // 渲染菜单表格
  const renderMenuTable = () => {
    if (!menuData) return null;
    const days = Object.keys(menuData);
    return (
      <div>
        <table ref={tableRef} border={1} style={{ marginTop: 20, width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>日期</th>
              <th style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>中餐-荤菜</th>
              <th style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>中餐-素菜</th>
              <th style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>晚餐-荤菜</th>
              <th style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>晚餐-素菜</th>
            </tr>
          </thead>
          <tbody>
            {days.map(day => (
              <tr key={day}>
                <td style={{ padding: '10px' }}>{day}</td>
                <td style={{ padding: '10px' }}>{menuData[day]['中餐']?.['荤菜']}</td>
                <td style={{ padding: '10px' }}>{menuData[day]['中餐']?.['素菜']}</td>
                <td style={{ padding: '10px' }}>{menuData[day]['晚餐']?.['荤菜']}</td>
                <td style={{ padding: '10px' }}>{menuData[day]['晚餐']?.['素菜']}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {menuData && (
          <button
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            onClick={handleDownload}
          >
            下载菜单
          </button>
        )}
      </div>
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
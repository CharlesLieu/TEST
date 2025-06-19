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
  const contentRef = useRef<HTMLDivElement>(null);

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
    if (!contentRef.current) return;
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        background: '#ffffff',
        logging: false,
        useCORS: true,
        width: contentRef.current.offsetWidth * 2,
        height: contentRef.current.offsetHeight * 2,
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
    
    // 检查数据结构
    const weeklyMenu = menuData.weekly_menu || menuData;
    const ingredientsSummary = menuData.ingredients_summary;
    
    const days = Object.keys(weeklyMenu);
    return (
      <div>
        <div ref={contentRef}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>每周菜单</h2>
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
                  <td style={{ padding: '10px' }}>{weeklyMenu[day]['中餐']?.['荤菜']}</td>
                  <td style={{ padding: '10px' }}>{weeklyMenu[day]['中餐']?.['素菜']}</td>
                  <td style={{ padding: '10px' }}>{weeklyMenu[day]['晚餐']?.['荤菜']}</td>
                  <td style={{ padding: '10px' }}>{weeklyMenu[day]['晚餐']?.['素菜']}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* 食材汇总表格 */}
          {ingredientsSummary && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>食材汇总</h3>
              <table border={1} style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px', backgroundColor: '#e8f5e8' }}>食材名称</th>
                    <th style={{ padding: '10px', backgroundColor: '#e8f5e8' }}>需要次数</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ingredientsSummary)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([ingredient, count]) => (
                      <tr key={ingredient}>
                        <td style={{ padding: '10px' }}>{ingredient}</td>
                        <td style={{ padding: '10px' }}>{count as number}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <p style={{ marginTop: '10px', color: '#666', textAlign: 'center' }}>
                总计食材种类: {Object.keys(ingredientsSummary).length}
              </p>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn btn-primary"
            onClick={handleDownload}
          >
            下载菜单
          </button>
        </div>
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
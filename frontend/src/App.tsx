import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PriceListPage from './pages/PriceListPage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const App: React.FC = () => {
  const [menuData, setMenuData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ingredientsRef = useRef<HTMLDivElement>(null);

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
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;

      // 1. 创建隐藏div用于菜单表格
      const menuDiv = document.createElement('div');
      menuDiv.style.position = 'fixed';
      menuDiv.style.left = '-9999px';
      menuDiv.style.top = '0';
      menuDiv.style.background = '#fff';
      menuDiv.style.zIndex = '9999';
      menuDiv.style.width = contentRef.current ? contentRef.current.offsetWidth + 'px' : '800px';
      menuDiv.innerHTML = contentRef.current ? contentRef.current.innerHTML : '';
      document.body.appendChild(menuDiv);

      // 2. 创建隐藏div用于食材汇总表格
      let ingredientsDiv: HTMLDivElement | null = null;
      if (ingredientsRef.current) {
        ingredientsDiv = document.createElement('div');
        ingredientsDiv.style.position = 'fixed';
        ingredientsDiv.style.left = '-9999px';
        ingredientsDiv.style.top = '0';
        ingredientsDiv.style.background = '#fff';
        ingredientsDiv.style.zIndex = '9999';
        ingredientsDiv.style.width = ingredientsRef.current.offsetWidth + 'px';
        ingredientsDiv.innerHTML = ingredientsRef.current.innerHTML;
        document.body.appendChild(ingredientsDiv);
      }

      // 3. 截图菜单表格
      const menuCanvas = await html2canvas(menuDiv, {
        background: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: menuDiv.offsetWidth,
        height: menuDiv.offsetHeight,
      });
      const menuImgHeight = (menuCanvas.height * imgWidth) / menuCanvas.width;
      const menuImageData = menuCanvas.toDataURL('image/jpeg', 0.9);
      pdf.addImage(menuImageData, 'JPEG', 0, 0, imgWidth, menuImgHeight);

      // 4. 截图食材汇总表格
      if (ingredientsDiv) {
        const ingredientsCanvas = await html2canvas(ingredientsDiv, {
          background: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: ingredientsDiv.offsetWidth,
          height: ingredientsDiv.offsetHeight,
        });
        const ingredientsImgHeight = (ingredientsCanvas.height * imgWidth) / ingredientsCanvas.width;
        const ingredientsImageData = ingredientsCanvas.toDataURL('image/jpeg', 0.9);
        pdf.addPage();
        pdf.addImage(ingredientsImageData, 'JPEG', 0, 0, imgWidth, ingredientsImgHeight);
      }

      // 5. 移除隐藏div
      document.body.removeChild(menuDiv);
      if (ingredientsDiv) document.body.removeChild(ingredientsDiv);

      // 6. 下载PDF
      pdf.save(`每周菜单_${new Date().toLocaleDateString()}.pdf`);
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
        {/* 菜单表格容器 */}
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
        </div>
        
        {/* 食材汇总表格容器 - 完全独立 */}
        {ingredientsSummary && (
          <div 
            ref={ingredientsRef} 
            style={{ 
              marginTop: '30px',
              border: '2px solid #e8f5e8',
              padding: '20px',
              borderRadius: '8px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#2e7d32' }}>食材汇总</h3>
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
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn btn-primary"
            onClick={handleDownload}
          >
            下载PDF
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PriceListPage from './pages/PriceListPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center space-y-4">
                <h1 className="text-3xl font-bold mb-8">什么煮糊了管理系统</h1>
                <Link 
                  to="/menu" 
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  上传我的菜单
                </Link>
                <Link 
                  to="/price-list" 
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  上传我的价格清单
                </Link>
              </div>
            } />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/price-list" element={<PriceListPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 
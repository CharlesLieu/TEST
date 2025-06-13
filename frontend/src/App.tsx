import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import PriceListPage from './pages/PriceListPage';
import RecipesPage from './pages/RecipesPage';
import RecipeRequirementsPage from './pages/RecipeRequirementsPage';
import RecipeGeneratorPage from './pages/RecipeGeneratorPage';
import TabBar from './components/TabBar';

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={
            <div>
              <h1>什么煮糊了管理系统</h1>
              <div className="button-container">
                <Link to="/menu" className="btn btn-primary">
                  上传我的菜单
                </Link>
                <Link to="/price-list" className="btn btn-primary">
                  上传我的价格清单
                </Link>
              </div>
            </div>
          } />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/price-list" element={<PriceListPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipe-requirements" element={<RecipeRequirementsPage />} />
          <Route path="/recipe-generator" element={<RecipeGeneratorPage />} />
        </Routes>
        <TabBar />
      </div>
    </Router>
  );
};

export default App; 
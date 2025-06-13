import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TabBar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="tab-bar">
      <Link 
        to="/recipes" 
        className={`tab-item ${location.pathname === '/recipes' ? 'active' : ''}`}
      >
        食谱
      </Link>
      <Link 
        to="/inventory" 
        className={`tab-item ${location.pathname === '/inventory' ? 'active' : ''}`}
      >
        库存
      </Link>
      <Link 
        to="/" 
        className={`tab-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        我的
      </Link>
    </div>
  );
};

export default TabBar; 
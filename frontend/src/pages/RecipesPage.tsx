import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isActivated, setIsActivated] = useState(false);

  const handleActivate = () => {
    setIsActivated(true);
    navigate('/recipe-requirements');
  };

  return (
    <div className="container">
      <h1>食谱</h1>
      {!isActivated && (
        <div className="activate-button-container">
          <button 
            onClick={handleActivate}
            className="btn btn-primary activate-button"
          >
            激活食谱
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipesPage; 
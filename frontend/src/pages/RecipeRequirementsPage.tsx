import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RecipeRequirementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<string[]>(['']);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const handleGenerate = () => {
    // 收集所有非空的需求
    const validRequirements = requirements.filter(req => req.trim() !== '');
    // 跳转到生成页面，并传递需求数据
    navigate('/recipe-generator', { state: { requirements: validRequirements } });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>食谱需求</h1>
        <button 
          onClick={handleAddRequirement}
          className="btn btn-primary"
        >
          添加需求
        </button>
      </div>

      <div className="requirements-container">
        {requirements.map((requirement, index) => (
          <div key={index} className="requirement-item">
            <input
              type="text"
              value={requirement}
              onChange={(e) => handleRequirementChange(index, e.target.value)}
              placeholder="请输入食谱需求"
              className="form-input"
            />
          </div>
        ))}
      </div>

      <div className="generate-button-container">
        <button 
          onClick={handleGenerate}
          className="btn btn-primary"
        >
          一键生成食谱
        </button>
      </div>
    </div>
  );
};

export default RecipeRequirementsPage; 
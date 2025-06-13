import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';

interface Recipe {
  day: string;
  lunch: {
    meat: string;
    vegetable: string;
  };
  dinner: {
    meat: string;
    vegetable: string;
  };
}

const RecipeGeneratorPage: React.FC = () => {
  const location = useLocation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 从路由状态中获取需求
    const requirements = location.state?.requirements || [];
    // TODO: 调用后端 API 生成食谱
    // 这里先使用模拟数据
    const mockRecipes: Recipe[] = [
      {
        day: '周一',
        lunch: { meat: '红烧肉', vegetable: '炒青菜' },
        dinner: { meat: '糖醋排骨', vegetable: '蒜蓉空心菜' }
      },
      // ... 其他天的食谱
    ];
    setRecipes(mockRecipes);
  }, [location]);

  const handleSaveImage = async () => {
    if (tableRef.current) {
      try {
        const canvas = await html2canvas(tableRef.current);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = '食谱.png';
        link.click();
      } catch (error) {
        console.error('保存图片失败:', error);
        alert('保存图片失败，请重试');
      }
    }
  };

  return (
    <div className="container">
      <h1>生成食谱</h1>
      
      <div ref={tableRef} className="recipe-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>午餐</th>
              <th>晚餐</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe, index) => (
              <tr key={index}>
                <td>{recipe.day}</td>
                <td>
                  <div>荤菜：{recipe.lunch.meat}</div>
                  <div>素菜：{recipe.lunch.vegetable}</div>
                </td>
                <td>
                  <div>荤菜：{recipe.dinner.meat}</div>
                  <div>素菜：{recipe.dinner.vegetable}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="save-button-container">
        <button 
          onClick={handleSaveImage}
          className="btn btn-primary"
        >
          保存到图库
        </button>
      </div>
    </div>
  );
};

export default RecipeGeneratorPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PriceItem {
  _id: string;
  name: string;
  hard: string;
  description: string;
  material: string;
}

const PriceListPage: React.FC = () => {
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载最新数据
  const loadLatestData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/price-list/latest');
      setPriceItems(response.data);
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    loadLatestData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/price-list/upload', formData);
      setPriceItems(response.data);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    }
  };

  const handleEdit = (item: PriceItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleSave = async (item: PriceItem) => {
    try {
      // 创建一个不包含 _id 的新对象
      const { _id, ...updateData } = item;
      const response = await axios.put(`http://localhost:5000/api/price-list/${_id}`, updateData);
      if (response.data.message === '更新成功') {
        setPriceItems(priceItems.map(i => 
          i._id === item._id ? item : i
        ));
        alert('保存成功');
      } else {
        alert('保存失败：' + response.data.error);
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      alert('保存失败：' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container">
      <h1>价格清单管理</h1>
      
      <div className="mb-6">
        <label className="btn btn-primary">
          重新上传价格清单
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn btn-primary"
          style={{ marginLeft: '10px' }}
        >
          {isEditing ? '完成编辑' : '编辑当前价格清单'}
        </button>
      </div>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>菜品名称</th>
                <th>难易程度</th>
                <th>菜品描述</th>
                <th>原材料</th>
                {isEditing && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {priceItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setPriceItems(priceItems.map(i => 
                          i._id === item._id ? {...i, name: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.hard}
                        onChange={(e) => setPriceItems(priceItems.map(i => 
                          i._id === item._id ? {...i, hard: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.hard
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => setPriceItems(priceItems.map(i => 
                          i._id === item._id ? {...i, description: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) => setPriceItems(priceItems.map(i => 
                          i._id === item._id ? {...i, material: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material
                    )}
                  </td>
                  {isEditing && (
                    <td>
                      <button
                        onClick={() => handleSave(item)}
                        className="btn btn-primary"
                      >
                        保存
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceListPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MenuItem {
  _id: string;
  name: string;
  hard: string;
  description: string;
  material1: string;
  material2: string;
  material3: string;
  material4: string;
  material5: string;
  material6: string;
}

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);

  // 加载最新数据
  const loadLatestData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/menu/latest');
      console.log('获取到的菜单数据:', response.data);
      console.log('数据类型:', typeof response.data);
      console.log('是否为数组:', Array.isArray(response.data));
      
      // 确保 response.data 是数组
      let data = response.data;
      if (!Array.isArray(data)) {
        console.log('数据不是数组，尝试转换...');
        // 如果数据是字符串，尝试解析
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('JSON解析失败:', e);
          }
        }
        // 如果仍然不是数组，则设置为空数组
        if (!Array.isArray(data)) {
          console.log('转换后仍不是数组，设置为空数组');
          data = [];
        }
      }
      
      console.log('处理后的菜单数据:', data);
      console.log('处理后数据类型:', typeof data);
      console.log('处理后是否为数组:', Array.isArray(data));
      
      setMenuItems(data);
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请刷新页面重试');
      setMenuItems([]); // 发生错误时设置为空数组
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
      const response = await axios.post('http://localhost:5000/api/menu/upload', formData);
      console.log('上传后的响应数据:', response.data);
      console.log('上传数据类型:', typeof response.data);
      console.log('上传数据是否为数组:', Array.isArray(response.data));
      
      // 确保 response.data 是数组
      let data = response.data;
      if (!Array.isArray(data)) {
        console.log('上传数据不是数组，尝试转换...');
        // 如果数据是字符串，尝试解析
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('JSON解析失败:', e);
          }
        }
        // 如果仍然不是数组，则设置为空数组
        if (!Array.isArray(data)) {
          console.log('转换后仍不是数组，设置为空数组');
          data = [];
        }
      }
      
      console.log('处理后的上传数据:', data);
      console.log('处理后数据类型:', typeof data);
      console.log('处理后是否为数组:', Array.isArray(data));
      
      setMenuItems(data);
      // 上传成功后重新加载数据
      await loadLatestData();
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    }
  };



  const handleSave = async (item: MenuItem) => {
    try {
      // 创建一个不包含 _id 的新对象
      const { _id, ...updateData } = item;
      const response = await axios.put(`http://localhost:5000/api/menu/${_id}`, updateData);
      if (response.data.message === '更新成功') {
        setMenuItems(menuItems.map(i => 
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
      <h1>菜单管理</h1>
      
      <div className="mb-6">
        <label className="btn btn-primary">
          重新上传我的菜单
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
          {isEditing ? '完成编辑' : '编辑当前菜单'}
        </button>
      </div>

      {loading ? (
        <div>加载中...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-4">暂无菜单数据</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>菜品名称</th>
                <th>难易程度</th>
                <th>菜品描述</th>
                <th>原材料1</th>
                <th>原材料2</th>
                <th>原材料3</th>
                <th>原材料4</th>
                <th>原材料5</th>
                <th>原材料6</th>
                {isEditing && <th>操作</th>}
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, name: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.name || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.hard || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, hard: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.hard || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, description: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.description || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material1 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material1: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material1 || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material2 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material2: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material2 || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material3 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material3: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material3 || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material4 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material4: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material4 || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material5 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material5: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material5 || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.material6 || ''}
                        onChange={(e) => setMenuItems(menuItems.map(i => 
                          i._id === item._id ? {...i, material6: e.target.value} : i
                        ))}
                        className="form-input"
                      />
                    ) : (
                      item.material6 || ''
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

export default MenuPage; 
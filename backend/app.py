from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB配置
client = MongoClient('mongodb://localhost:27017/')
db = client['menu_management']
menu_collection = db['menu']
price_list_collection = db['price_list']

# 文件上传配置
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_to_string(value):
    """将值转换为字符串，处理 NaN 和 None 的情况"""
    if pd.isna(value) or value is None:
        return ''
    return str(value)

@app.route('/api/menu/upload', methods=['POST'])
def upload_menu():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # 读取Excel文件
        df = pd.read_excel(filepath)
        
        # 打印列名，方便调试
        print("Excel列名:", df.columns.tolist())
        
        # 清空现有数据
        menu_collection.delete_many({})
        
        # 插入新数据
        menu_items = []
        for _, row in df.iterrows():
            item = {
                'name': convert_to_string(row['菜品名称']),
                'hard': convert_to_string(row['难易程度']),
                'description': convert_to_string(row['菜品描述']),
                'material1': convert_to_string(row['原材料1']),
                'material2': convert_to_string(row['原材料2']),
                'material3': convert_to_string(row['原材料3']),
                'material4': convert_to_string(row['原材料4']),
                'material5': convert_to_string(row['原材料5']),
                'material6': convert_to_string(row['原材料6'])
            }
            menu_items.append(item)
        
        if menu_items:
            result = menu_collection.insert_many(menu_items)
            # 把 ObjectId 转成字符串
            for i, item in enumerate(menu_items):
                item['_id'] = str(result.inserted_ids[i])
        
        # 删除临时文件
        os.remove(filepath)
        
        return jsonify(menu_items)
    
    return jsonify({'error': '不支持的文件类型'}), 400

@app.route('/api/price-list/upload', methods=['POST'])
def upload_price_list():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # 读取Excel文件
        df = pd.read_excel(filepath)
        
        # 打印列名，方便调试
        print("Excel列名:", df.columns.tolist())
        
        # 清空现有数据
        price_list_collection.delete_many({})
        
        # 插入新数据
        price_items = []
        for _, row in df.iterrows():
            item = {
                'name': row['菜品名称'],   # 对应数据库的name字段
                'hard': row['难易程度'],   # 对应数据库的hard字段
                'description': row['菜品描述'],  # 对应数据库的description字段
                'material': row['原材料']   # 对应数据库的material字段
            }
            price_items.append(item)
        
        if price_items:
            result = price_list_collection.insert_many(price_items)
            # 把 ObjectId 转成字符串
            for i, item in enumerate(price_items):
                item['_id'] = str(result.inserted_ids[i])
        
        # 删除临时文件
        os.remove(filepath)
        
        return jsonify(price_items)
    
    return jsonify({'error': '不支持的文件类型'}), 400

@app.route('/api/menu/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    data = request.json
    try:
        # 将字符串 _id 转换为 ObjectId
        result = menu_collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': data}
        )
        if result.modified_count > 0:
            return jsonify({'message': '更新成功'})
        else:
            return jsonify({'error': '未找到要更新的数据'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/price-list/<item_id>', methods=['PUT'])
def update_price_item(item_id):
    data = request.json
    try:
        # 将字符串 _id 转换为 ObjectId
        result = price_list_collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': data}
        )
        if result.modified_count > 0:
            return jsonify({'message': '更新成功'})
        else:
            return jsonify({'error': '未找到要更新的数据'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/menu/latest', methods=['GET'])
def get_latest_menu():
    # 获取最新的菜单数据
    menu_items = list(menu_collection.find())
    # 将 ObjectId 转换为字符串，并确保所有字段都是字符串类型
    for item in menu_items:
        item['_id'] = str(item['_id'])
        # 确保所有字段都是字符串类型
        for key in item:
            item[key] = convert_to_string(item[key])
    return jsonify(menu_items)

@app.route('/api/price-list/latest', methods=['GET'])
def get_latest_price_list():
    # 获取最新的价格清单数据
    price_items = list(price_list_collection.find())
    # 将 ObjectId 转换为字符串
    for item in price_items:
        item['_id'] = str(item['_id'])
    return jsonify(price_items)

if __name__ == '__main__':
    app.run(debug=True) 
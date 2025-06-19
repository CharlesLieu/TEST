from pymongo import MongoClient
import random
from datetime import datetime, timedelta

def connect_to_mongodb():
    """连接到MongoDB数据库"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        # 测试连接
        client.admin.command('ping')
        print("MongoDB连接成功！")
        
        db = client['menu_management']  # 修改为您的数据库名
        # 检查数据库是否存在
        if 'menu_management' not in client.list_database_names():
            print("警告：数据库 'menu_management' 不存在！")
        else:
            print("数据库 'menu_management' 存在")
            
        # 检查集合是否存在
        collections = db.list_collection_names()
        if 'menu' not in collections:
            print("警告：集合 'menu' 不存在！")
        else:
            print("集合 'menu' 存在")
            # 获取集合中的文档数量
            count = db.menu.count_documents({})
            print(f"menu集合中的文档数量: {count}")
            
        return db
    except Exception as e:
        print(f"数据库连接错误: {str(e)}")
        raise

def get_dishes(db):
    """从数据库获取所有菜品"""
    try:
        menu_collection = db['menu']
        dishes = list(menu_collection.find({}, {
            'name': 1, 
            'description': 1, 
            'material1': 1,
            'material2': 1,
            'material3': 1,
            'material4': 1,
            'material5': 1,
            'material6': 1,
            '_id': 0
        }))
        print(f"\n从数据库获取到的菜品数量: {len(dishes)}")
        if len(dishes) > 0:
            print("示例菜品数据:")
            print(dishes[0])
        return dishes
    except Exception as e:
        print(f"获取菜品数据错误: {str(e)}")
        raise

def separate_dishes(dishes):
    """将菜品分为荤菜和素菜"""
    meat_dishes = []
    veg_dishes = []
    
    print("\n=== 菜品分类情况 ===")
    print(f"总菜品数量: {len(dishes)}")
    
    for dish in dishes:
        print(f"菜品: {dish['name']}, 描述: {dish['description']}")
        if '荤' in dish['description']:
            meat_dishes.append(dish)
        elif '素' in dish['description']:
            veg_dishes.append(dish)
    
    print(f"\n荤菜数量: {len(meat_dishes)}")
    print(f"素菜数量: {len(veg_dishes)}")
    print("=" * 20)
    
    return meat_dishes, veg_dishes

def generate_weekly_menu(meat_dishes, veg_dishes):
    """生成一周的菜单"""
    if len(meat_dishes) < 14 or len(veg_dishes) < 14:
        raise ValueError("菜品数量不足，需要至少14个荤菜和14个素菜")
    
    # 随机选择菜品
    selected_meat = random.sample(meat_dishes, 14)
    selected_veg = random.sample(veg_dishes, 14)
    
    # 生成一周的日期
    today = datetime.now()
    dates = [(today + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]
    
    # 生成菜单
    weekly_menu = {}
    for i, date in enumerate(dates):
        daily_menu = {
            '中餐': {
                '荤菜': selected_meat[i*2]['name'],
                '素菜': selected_veg[i*2]['name']
            },
            '晚餐': {
                '荤菜': selected_meat[i*2+1]['name'],
                '素菜': selected_veg[i*2+1]['name']
            }
        }
        weekly_menu[date] = daily_menu
    
    return weekly_menu

def generate_ingredients_summary(weekly_menu, meat_dishes, veg_dishes):
    """生成食材汇总表格"""
    # 创建菜品名称到完整菜品信息的映射
    dish_map = {}
    for dish in meat_dishes + veg_dishes:
        dish_map[dish['name']] = dish
    
    # 收集所有需要的食材
    ingredients_count = {}
    
    for date, meals in weekly_menu.items():
        for meal_type, dishes in meals.items():
            for dish_type, dish_name in dishes.items():
                if dish_name in dish_map:
                    dish_info = dish_map[dish_name]
                    # 收集该菜品的所有食材
                    for i in range(1, 7):
                        material_key = f'material{i}'
                        if material_key in dish_info and dish_info[material_key]:
                            material = dish_info[material_key].strip()
                            if material:  # 确保食材不为空
                                if material in ingredients_count:
                                    ingredients_count[material] += 1
                                else:
                                    ingredients_count[material] = 1
    
    return ingredients_count

def print_ingredients_summary(ingredients_count):
    """打印食材汇总表格"""
    if not ingredients_count:
        print("\n=== 食材汇总 ===")
        print("暂无食材信息")
        return
    
    print("\n=== 食材汇总 ===")
    print("食材名称".ljust(20) + "|" + "需要次数".ljust(10))
    print("-" * 30)
    
    # 按食材名称排序
    sorted_ingredients = sorted(ingredients_count.items(), key=lambda x: x[0])
    
    for ingredient, count in sorted_ingredients:
        print(f"{ingredient.ljust(20)}|{str(count).ljust(10)}")
    
    print("-" * 30)
    print(f"总计食材种类: {len(ingredients_count)}")

def print_menu(weekly_menu):
    """打印菜单"""
    print("\n=== 每周菜谱 ===")
    for date, meals in weekly_menu.items():
        print(f"\n{date}")
        print("=" * 20)
        for meal_type, dishes in meals.items():
            print(f"\n{meal_type}:")
            print(f"  荤菜：{dishes['荤菜']}")
            print(f"  素菜：{dishes['素菜']}")

def get_weekly_menu_json():
    try:
        db = connect_to_mongodb()
        dishes = get_dishes(db)
        meat_dishes, veg_dishes = separate_dishes(dishes)
        weekly_menu = generate_weekly_menu(meat_dishes, veg_dishes)
        ingredients_count = generate_ingredients_summary(weekly_menu, meat_dishes, veg_dishes)
        return {
            "weekly_menu": weekly_menu,
            "ingredients_summary": ingredients_count
        }
    except Exception as e:
        return {"error": str(e)}

def main():
    try:
        # 连接数据库
        db = connect_to_mongodb()
        
        # 获取所有菜品
        dishes = get_dishes(db)
        
        # 分离荤素菜
        meat_dishes, veg_dishes = separate_dishes(dishes)
        
        # 生成并打印菜单
        weekly_menu = generate_weekly_menu(meat_dishes, veg_dishes)
        print_menu(weekly_menu)
        
        # 生成并打印食材汇总
        ingredients_count = generate_ingredients_summary(weekly_menu, meat_dishes, veg_dishes)
        print_ingredients_summary(ingredients_count)
        
    except Exception as e:
        print(f"发生错误: {str(e)}")

if __name__ == "__main__":
    main() 
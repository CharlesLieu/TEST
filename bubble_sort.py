def bubble_sort(arr):
    """
    冒泡排序函数
    参数:
        arr: 需要排序的列表
    返回:
        排序后的列表
    """
    n = len(arr)
    # 外层循环控制需要进行多少轮比较
    for i in range(n):
        # 内层循环进行相邻元素比较和交换
        # 每轮结束后，最大的元素会"冒泡"到最后，所以可以减少比较次数
        for j in range(0, n-i-1):
            # 如果前面的元素大于后面的元素，则交换它们
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def main():
    # 测试用例222
    test_cases = [
        [64, 34, 25, 12, 22, 11, 90],
        [5, 2, 8, 12, 1, 3],
        [1],
        [],
        [1, 1, 1, 1],
        [9, 8, 7, 6, 5, 4, 3, 2, 1]
    ]
    
    for arr in test_cases:
        print(f"原始数组: {arr}")
        sorted_arr = bubble_sort(arr.copy())
        print(f"排序后: {sorted_arr}")
        print("-" * 50)

if __name__ == "__main__":
    main() 
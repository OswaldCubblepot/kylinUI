import os
from flask import Flask, jsonify
from threading import Thread
import pandas as pd
import time

app = Flask(__name__)

# 全局变量存储当前有效的状态
current_status = None
current_score = None  # 新增变量存储当前的分数

def read_and_process_csv():
    global current_status
    while True:
        try:
            # 读取 CSV 文件
            data = pd.read_csv(os.path.join('cated.csv'))
            last_eight = data['status'].values[-8:]  # 获取最后8个状态

            # 检查是否有6个及以上相同的数字
            if any(last_eight.tolist().count(x) >= 6 for x in set(last_eight)):
                # 更新当前状态
                current_status = int(max(set(last_eight), key=last_eight.tolist().count))  # 转换为 Python 的 int 类型
        
        except Exception as e:
            print(f"Error reading or processing the CSV: {e}")

        # 每24秒检查一次文件
        time.sleep(24)

def read_score_csv():
    global current_score
    while True:
        try:
            # 读取 CSV 文件（路径和列标签预留给用户）
            data = pd.read_csv(os.path.join('scored.csv'))
            current_score = data['Predicted_Performance_Score'].values[-1]  # 获取最新的分数
        
        except Exception as e:
            print(f"Error reading or processing the score CSV: {e}")

        # 每24秒检查一次文件
        time.sleep(24)

@app.route('/')
def home():
    return "Welcome to the Flask app! Use /get_status to check the current status."

@app.route('/get_status')
def get_status():
    if current_status is not None or current_score is not None:
        return jsonify({'type': current_status, 'score': current_score})  # 返回两个数字
    else:
        # 如果当前没有有效的状态数据，返回一个默认的状态
        return jsonify({'status': 'data not available'})

def run_app():
    app.run(port=5000, debug=True)

if __name__ == "__main__":
    # 启动后台线程来读取并处理 CSV 文件
    Thread(target=read_and_process_csv).start()
    # 启动后台线程来读取分数 CSV 文件
    Thread(target=read_score_csv).start()
    # 启动 Flask 应用
    run_app()


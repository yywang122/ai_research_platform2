# Backend MVP (Flask + SQLite)

本目錄提供 AI Research Paper Intelligence Platform 的後端 MVP。

## 需求

- Python 3.10+

## 安裝與啟動

1. 建立虛擬環境（可選）

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. 安裝依賴

```bash
pip install -r backend/requirements.txt
```

3. 啟動後端

```bash
python backend/run.py
```

啟動後預設位址：`http://127.0.0.1:5000`

## API 前綴

所有 API 皆使用 `/api/*`。

## 備註

- SQLite 檔案位置：`backend/data/app.db`
- 啟動時會自動初始化資料表並補最小測試 papers 資料


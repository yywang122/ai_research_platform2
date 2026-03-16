# Frontend MVP (React + MUI)

此目錄為 AI Research Paper Intelligence Platform 的前端 MVP，僅前端範圍，串接既有後端 `/api`。

## 已實作頁面

- 首頁 `/`
- 註冊/登入 `/auth`
- 論文搜尋 `/papers`
- 論文詳情 `/papers/:paperId`
- 收藏 `/favorites`
- 閱讀清單 `/reading-list`
- AI 分析 `/analysis`

## 已串接 API

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me`
- `/api/papers`
- `/api/papers/{paper_id}`
- `/api/favorites`（list/add/remove）
- `/api/reading-list`（list/add/update/remove）
- `/api/analyze`（submit/get/history）
- `/api/recommendations`

## 啟動方式

1. 啟動後端（預設 `http://127.0.0.1:5000`）：

```bash
python backend/run.py
```

2. 安裝前端依賴：

```bash
cd frontend
npm install
```

3. 啟動前端：

```bash
npm run dev
```

預設前端位址：`http://127.0.0.1:5173`

## 設定

- 預設透過 [`vite.config.js`](vite.config.js) proxy `/api` 到 `http://127.0.0.1:5000`。
- 若需改用其他 API host，可設定環境變數：

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

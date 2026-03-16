# AI Research Paper Intelligence Platform - ARCHITECTURE SPEC

## 1) 文件目的

本文件基於 [`DESIGN.md`](DESIGN.md) 擴展為可直接落地實作的系統架構規格，聚焦：
- React 前端元件結構
- Flask 後端模組分層
- SQLite 資料庫 schema
- 指定 API 群組：`/api/auth`、`/api/papers`、`/api/favorites`、`/api/reading-list`、`/api/analyze`
- AI 摘要與推薦資料流

專案正式名稱：**AI Research Paper Intelligence Platform**。

---

## 2) 系統總覽（可實作版）

### 2.1 架構型態

- 前後端分離：React SPA + Flask REST API
- 單體後端（modular monolith）：以 Blueprint + service/repository 分層
- 單一資料庫：SQLite（MVP），後續可平滑升級 PostgreSQL

### 2.2 邏輯元件

1. **Frontend App（React + MUI）**
   - 路由頁面、元件組裝、狀態管理、API 存取
2. **Backend API（Flask）**
   - 身分驗證、論文查詢、收藏/閱讀清單、AI 分析協調、推薦查詢
3. **Database（SQLite）**
   - 儲存使用者資料、論文索引、行為資料、AI 分析結果、推薦快照
4. **AI Analysis Engine（後端內部模組）**
   - 摘要、方法提取、應用場景、標籤分類

---

## 3) Frontend 架構（React component 結構）

### 3.1 頁面層（Page Containers）

- `HomePage`：平台介紹、熱門入口
- `AuthPage`：註冊/登入
- `PaperSearchPage`：搜尋 + 篩選 + 卡片列表
- `PaperDetailPage`：論文細節 + 收藏 + 閱讀清單 + 分析觸發
- `FavoritesPage`：收藏管理
- `ReadingListPage`：閱讀清單與狀態管理
- `AIAnalysisPage`：分析結果瀏覽

### 3.2 元件分層（具體）

#### A. Layout Components
- `AppShell`
- `TopNav`
- `SidebarFilters`
- `PageHeader`

#### B. Paper Domain Components
- `PaperSearchBar`
- `PaperFilterPanel`（年份/領域/會議）
- `PaperCard`
- `PaperCardActions`（收藏、加入閱讀清單、分析）
- `PaperList`
- `PaperDetailHeader`
- `PaperMetadata`
- `PaperAbstractBlock`

#### C. User Library Components
- `FavoriteToggleButton`
- `FavoritesList`
- `ReadingListTable`
- `ReadingStatusChip`
- `ReadingListActions`

#### D. AI Components
- `AnalyzeButton`
- `AnalysisStatusBadge`（pending/completed/failed）
- `AISummaryPanel`
- `MethodologyPanel`
- `ApplicationsPanel`
- `TagCluster`

#### E. Auth Components
- `LoginForm`
- `RegisterForm`
- `AuthGuard`

### 3.3 前端狀態模型（建議）

- `authState`：`user`、`token`、`isAuthenticated`
- `paperSearchState`：`query`、`filters`、`results`、`pagination`
- `libraryState`：`favorites`、`readingList`
- `analysisState`：`analysisByPaperId`、`loadingStatus`

### 3.4 前端資料流

1. View 觸發操作
2. 呼叫 API service
3. 回寫 context/store
4. 元件依 state 重渲染

---

## 4) Backend 架構（Flask module 分層）

### 4.1 分層責任

1. **API Layer（Blueprint / routes）**
   - 解析 request、呼叫 service、回傳標準 response
2. **Service Layer（業務邏輯）**
   - 驗證規則、流程編排、交易邊界
3. **Repository Layer（資料存取）**
   - SQL/ORM 存取隔離
4. **Domain Model / DTO Layer**
   - 資料結構與輸出模型
5. **Integration Layer（AI Adapter）**
   - 封裝 AI 模型呼叫與重試策略

### 4.2 Flask 模組切分（對應 API 群組）

- `auth` 模組 → `/api/auth/*`
- `papers` 模組 → `/api/papers/*`
- `favorites` 模組 → `/api/favorites/*`
- `reading_list` 模組 → `/api/reading-list/*`
- `analyze` 模組 → `/api/analyze/*`
- `recommendation` 模組（可選）→ `/api/recommendations/*`

### 4.3 後端共用元件

- `middleware/auth_middleware`：JWT 或 session token 驗證
- `middleware/error_handler`：統一錯誤格式
- `core/response`：統一回應包裝
- `core/validators`：query/body 驗證
- `core/pagination`：分頁規則
- `core/rate_limit`：敏感 API 速率限制

---

## 5) SQLite Schema（具體資料表）

> 型別以 SQLite 實務為準：`INTEGER`, `TEXT`, `REAL`, `DATETIME`。

### 5.1 `users`
- `id` INTEGER PK
- `email` TEXT NOT NULL UNIQUE
- `password_hash` TEXT NOT NULL
- `display_name` TEXT
- `created_at` DATETIME NOT NULL
- `updated_at` DATETIME NOT NULL

索引：
- unique index on `email`

### 5.2 `papers`
- `id` INTEGER PK
- `title` TEXT NOT NULL
- `abstract` TEXT
- `authors` TEXT
- `year` INTEGER
- `domain` TEXT
- `venue` TEXT
- `keywords` TEXT
- `source_url` TEXT
- `created_at` DATETIME NOT NULL

索引：
- index on (`year`)
- index on (`domain`)
- index on (`venue`)
- index on (`title`)

### 5.3 `favorites`
- `id` INTEGER PK
- `user_id` INTEGER NOT NULL FK -> users.id
- `paper_id` INTEGER NOT NULL FK -> papers.id
- `created_at` DATETIME NOT NULL

約束：
- UNIQUE (`user_id`, `paper_id`)

索引：
- index on (`user_id`)
- index on (`paper_id`)

### 5.4 `reading_list`
- `id` INTEGER PK
- `user_id` INTEGER NOT NULL FK -> users.id
- `paper_id` INTEGER NOT NULL FK -> papers.id
- `status` TEXT NOT NULL（`unread` / `reading` / `done`）
- `priority` INTEGER DEFAULT 0
- `note` TEXT
- `created_at` DATETIME NOT NULL
- `updated_at` DATETIME NOT NULL

約束：
- UNIQUE (`user_id`, `paper_id`)

索引：
- index on (`user_id`, `status`)

### 5.5 `search_history`
- `id` INTEGER PK
- `user_id` INTEGER FK -> users.id（可為 NULL）
- `query_text` TEXT
- `filters_json` TEXT
- `result_count` INTEGER
- `created_at` DATETIME NOT NULL

索引：
- index on (`user_id`, `created_at`)

### 5.6 `ai_analysis_results`
- `id` INTEGER PK
- `paper_id` INTEGER NOT NULL FK -> papers.id
- `requested_by` INTEGER NOT NULL FK -> users.id
- `summary` TEXT
- `methodology` TEXT
- `applications` TEXT
- `tags_json` TEXT
- `model_name` TEXT
- `status` TEXT NOT NULL（`pending` / `completed` / `failed`）
- `error_message` TEXT
- `created_at` DATETIME NOT NULL
- `completed_at` DATETIME

索引：
- index on (`paper_id`, `created_at`)
- index on (`requested_by`, `created_at`)
- index on (`status`)

### 5.7 `recommendations`
- `id` INTEGER PK
- `user_id` INTEGER NOT NULL FK -> users.id
- `paper_id` INTEGER NOT NULL FK -> papers.id
- `reason` TEXT
- `score` REAL
- `generated_at` DATETIME NOT NULL

索引：
- index on (`user_id`, `generated_at`)
- index on (`user_id`, `score`)

---

## 6) API 規格（指定群組）

回應格式建議統一：
- 成功：`{ success: true, data, meta? }`
- 失敗：`{ success: false, error: { code, message } }`

### 6.1 `/api/auth`

1. `POST /api/auth/register`
   - 用途：註冊帳號
   - Body：`email`, `password`, `display_name`
   - 回傳：使用者基本資訊

2. `POST /api/auth/login`
   - 用途：登入
   - Body：`email`, `password`
   - 回傳：`access_token`, `user`

3. `GET /api/auth/me`
   - 用途：取得當前登入者資訊
   - Header：Authorization

4. `POST /api/auth/logout`
   - 用途：登出（若採 token 黑名單或 session）

### 6.2 `/api/papers`

1. `GET /api/papers`
   - 用途：搜尋與篩選論文
   - Query：`q`, `year`, `domain`, `venue`, `page`, `page_size`, `sort`
   - 回傳：分頁論文列表

2. `GET /api/papers/{paper_id}`
   - 用途：取得論文詳情

3. `GET /api/papers/{paper_id}/analysis`
   - 用途：讀取該論文最新分析結果（供詳情頁快速顯示）

### 6.3 `/api/favorites`

1. `GET /api/favorites`
   - 用途：取得目前使用者收藏列表

2. `POST /api/favorites`
   - 用途：新增收藏
   - Body：`paper_id`

3. `DELETE /api/favorites/{paper_id}`
   - 用途：取消收藏

### 6.4 `/api/reading-list`

1. `GET /api/reading-list`
   - 用途：取得閱讀清單
   - Query：`status`, `sort`, `page`, `page_size`

2. `POST /api/reading-list`
   - 用途：加入閱讀清單
   - Body：`paper_id`, `priority?`, `note?`

3. `PATCH /api/reading-list/{paper_id}`
   - 用途：更新閱讀條目
   - Body：`status?`, `priority?`, `note?`

4. `DELETE /api/reading-list/{paper_id}`
   - 用途：移除閱讀條目

### 6.5 `/api/analyze`

1. `POST /api/analyze`
   - 用途：提交 AI 分析請求
   - Body：`paper_id`, `force_refresh?`
   - 行為：建立 pending 記錄並啟動分析

2. `GET /api/analyze/{paper_id}`
   - 用途：查詢指定論文最新分析結果

3. `GET /api/analyze/history`
   - 用途：查詢目前使用者分析歷史
   - Query：`page`, `page_size`, `status`

---

## 7) 關鍵流程

### 7.1 Authentication Flow

1. 前端提交註冊或登入資料到 `/api/auth/*`
2. 後端驗證帳密、產生 token
3. 前端保存 token 並更新 `authState`
4. 後續受保護 API 帶 Authorization 呼叫

### 7.2 Paper Search Flow

1. 使用者在搜尋頁輸入關鍵字與篩選
2. 前端呼叫 `GET /api/papers`
3. 後端查詢 `papers`，同時記錄 `search_history`
4. 回傳卡片資料與分頁資訊

### 7.3 Favorites Flow

1. 使用者點選收藏
2. 前端呼叫 `POST /api/favorites`
3. 後端寫入 `favorites`（重複請求以 unique constraint 保證冪等）
4. 收藏頁透過 `GET /api/favorites` 取得完整列表

### 7.4 Reading List Flow

1. 使用者加入閱讀清單：`POST /api/reading-list`
2. 更新狀態：`PATCH /api/reading-list/{paper_id}`
3. 列表頁依 status 分群呈現

---

## 8) AI 摘要資料流（AI Summary Data Flow）

1. 使用者於論文詳情頁點擊 Analyze
2. 前端呼叫 `POST /api/analyze` 傳入 `paper_id`
3. 後端在 `ai_analysis_results` 建立 `pending`
4. `analyze_service` 取 `papers` 內容（title/abstract/keywords）
5. `prompt_builder` 組裝輸入
6. `llm_adapter` 呼叫模型
7. `post_processor` 轉為固定欄位（summary/methodology/applications/tags）
8. 更新 `ai_analysis_results` 為 `completed` 或 `failed`
9. 前端以 `GET /api/analyze/{paper_id}` 取得結果顯示

失敗處理：
- 記錄 `error_message`
- 回傳可重試狀態
- 若 `force_refresh=true` 可重跑分析

---

## 9) 推薦資料流（Recommendation Data Flow）

### 9.1 輸入訊號
- `search_history`：關鍵字與篩選偏好
- `favorites`：高興趣論文
- `reading_list`：閱讀狀態與優先級
- `ai_analysis_results.tags_json`：主題偏好

### 9.2 推薦產生流程

1. 週期任務或使用者請求觸發推薦計算
2. 彙整使用者行為特徵（領域、會議、年份區間、關鍵字）
3. 從 `papers` 篩出候選集
4. 計算分數（規則式）：
   - 領域匹配
   - 標籤匹配
   - 新穎度（年份）
   - 與已收藏重複排除
5. 寫入 `recommendations`
6. 前端頁面讀取推薦列表（可用 `/api/papers` + 推薦條件，或獨立推薦 API）

### 9.3 MVP 建議
- 第一版採規則式推薦即可落地
- 第二版再升級 embedding/向量相似度

---

## 10) 建議資料夾結構（落地版）

```text
ai_research_platform/
├─ ARCHITECT.md
├─ DESIGN.md
├─ frontend/
│  └─ src/
│     ├─ pages/
│     │  ├─ HomePage/
│     │  ├─ AuthPage/
│     │  ├─ PaperSearchPage/
│     │  ├─ PaperDetailPage/
│     │  ├─ FavoritesPage/
│     │  ├─ ReadingListPage/
│     │  └─ AIAnalysisPage/
│     ├─ components/
│     │  ├─ layout/
│     │  ├─ paper/
│     │  ├─ auth/
│     │  ├─ library/
│     │  └─ ai/
│     ├─ services/
│     │  ├─ authService
│     │  ├─ paperService
│     │  ├─ favoritesService
│     │  ├─ readingListService
│     │  └─ analyzeService
│     ├─ contexts/
│     ├─ hooks/
│     ├─ utils/
│     └─ router/
└─ backend/
   └─ app/
      ├─ routes/
      │  ├─ auth
      │  ├─ papers
      │  ├─ favorites
      │  ├─ reading_list
      │  └─ analyze
      ├─ services/
      ├─ repositories/
      ├─ models/
      ├─ ai_module/
      ├─ middleware/
      └─ core/
```

---

## 11) 非功能需求（實作必備）

### 安全
- password 僅存 hash
- 受保護 API 強制 token 驗證
- `/api/auth/login`、`/api/analyze` 實施 rate limit

### 效能
- `papers` 的 `year/domain/venue` 索引必建
- 搜尋結果採分頁（必要）

### 可靠性
- AI 分析必有 `pending/completed/failed` 狀態
- 分析失敗需可重試

### 可維運
- 統一錯誤碼
- API 觀測欄位：request id、latency、error rate

---

## 12) 實作結論

本版 `ARCHITECT` 已具體補強：
- React component 結構到可切任務層級
- Flask module 分層到 API/Service/Repository 級別
- SQLite schema 到欄位、約束與索引
- 指定 endpoints 完整覆蓋：`/api/auth`、`/api/papers`、`/api/favorites`、`/api/reading-list`、`/api/analyze`
- AI 摘要與推薦資料流具體可落地

可直接作為 MVP 開發藍圖，並支援後續擴展。

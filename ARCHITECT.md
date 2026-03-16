# AI Research Paper Intelligence Platform - 系統架構文件

## 1. 文件目的與範圍

本文件定義 **AI Research Paper Intelligence Platform** 的可實作系統架構，作為產品開發、工程落地、資料模型設計與 API 規劃的基準。

系統核心目標：
- 提供使用者搜尋近年 AI / 醫療 / 機器人領域論文。
- 支援帳號註冊登入、收藏、閱讀清單與個人化整理。
- 透過 AI 模組產生摘要、研究方法整理、應用場景建議與分類標籤。

---

## 2. 系統總覽（High-Level Architecture）

系統採用前後端分離架構，並以 Flask 提供 `/api` 為前綴的 RESTful 服務，SQLite 作為主要資料儲存。

### 架構分層

1. **Frontend（React + MUI）**
   - 提供頁面與互動體驗。
   - 透過 HTTP/JSON 呼叫後端 API。
2. **Backend（Flask）**
   - 負責驗證授權、商業邏輯、資料查詢、AI 分析流程協調。
3. **Database（SQLite）**
   - 儲存使用者、論文、收藏、閱讀清單、搜尋紀錄、AI 分析結果。
4. **AI Analysis Module**
   - 對論文內容（標題、摘要、關鍵字）進行摘要、分類、重點提取與應用場景生成。

### 邏輯資料流

1. 使用者在前端登入後取得 access token。
2. 前端帶 token 呼叫搜尋 API，後端回傳論文卡片資料。
3. 使用者可將論文加入收藏或閱讀清單。
4. 使用者觸發 AI 分析時，後端建立分析任務並執行 AI 模組。
5. AI 分析結果寫入資料庫，前端可於論文詳情頁或 AI 分析頁查看。

---

## 3. Frontend 架構

### 技術與責任

- **框架**：React
- **UI 元件**：MUI
- **狀態管理**：建議使用 React Context + hooks（中小型專案可實作）
- **路由**：React Router

### 頁面規劃

1. **首頁**
   - 平台介紹、熱門論文入口、登入註冊導引。
2. **註冊 / 登入頁**
   - Email/Password 註冊登入。
   - 登入後保存 token 與使用者基本資訊。
3. **論文搜尋頁**
   - 搜尋關鍵字。
   - 篩選：年份、研究領域、會議/期刊。
   - 卡片化顯示論文列表。
4. **論文詳情頁**
   - 顯示標題、作者、年份、會議、摘要、標籤。
   - 提供收藏、加入閱讀清單、觸發 AI 分析。
5. **我的收藏頁**
   - 顯示已收藏論文、快速取消收藏。
6. **閱讀清單頁**
   - 顯示閱讀狀態（未讀 / 閱讀中 / 已完成）。
   - 支援排序與狀態更新。
7. **AI 分析頁**
   - 顯示 AI 摘要、研究方法重點、應用場景、分類標籤與分析時間。

### 前端模組分層（建議）

- `pages/`：路由頁面容器。
- `components/`：PaperCard、FilterPanel、SearchBar、AuthForm 等可重用元件。
- `services/`：封裝 API 呼叫。
- `stores/` 或 `contexts/`：使用者會話、全域篩選條件。
- `utils/`：格式化與共用工具函式。

---

## 4. Backend 架構

### 技術與責任

- **框架**：Flask
- **API 路徑前綴**：`/api`
- **責任**：
  - 身分驗證與授權
  - 論文查詢與條件篩選
  - 收藏/閱讀清單管理
  - AI 分析任務啟動與結果持久化
  - 推薦 API（可基於搜尋與收藏行為）

### 模組劃分（建議）

1. **Auth Module**
   - 註冊、登入、token 驗證。
2. **Paper Module**
   - 論文清單查詢、詳情查詢、條件篩選。
3. **User Library Module**
   - 收藏管理、閱讀清單管理、閱讀狀態更新。
4. **AI Module**
   - 分析請求接收、分析執行、結果存取。
5. **Recommendation Module**
   - 依歷史行為回傳推薦論文。

### 可實作性說明

- 單體 Flask + SQLite 對 MVP 與中小流量足夠。
- AI 分析可先採同步執行；若耗時增長可升級為背景任務（如 queue + worker）。
- API 設計採 REST 標準，便於前端與未來行動端整合。

---

## 5. Database 架構（SQLite）

以下為主要資料表（MVP 必要）

### 5.1 users
- `id` (PK)
- `email` (UNIQUE)
- `password_hash`
- `display_name`
- `created_at`
- `updated_at`

### 5.2 papers
- `id` (PK)
- `title`
- `abstract`
- `authors`（可先以字串儲存，後續正規化）
- `year`
- `domain`（AI / 醫療 / 機器人）
- `venue`（會議/期刊）
- `keywords`
- `source_url`
- `created_at`

### 5.3 favorites
- `id` (PK)
- `user_id` (FK -> users.id)
- `paper_id` (FK -> papers.id)
- `created_at`
- Unique Constraint: (`user_id`, `paper_id`)

### 5.4 reading_list
- `id` (PK)
- `user_id` (FK -> users.id)
- `paper_id` (FK -> papers.id)
- `status`（unread / reading / done）
- `priority`（optional）
- `note`（optional）
- `created_at`
- `updated_at`
- Unique Constraint: (`user_id`, `paper_id`)

### 5.5 search_history
- `id` (PK)
- `user_id` (FK -> users.id, nullable for guest)
- `query_text`
- `filters_json`
- `result_count`
- `created_at`

### 5.6 ai_analysis_results
- `id` (PK)
- `paper_id` (FK -> papers.id)
- `requested_by` (FK -> users.id)
- `summary`
- `methodology`
- `applications`
- `tags_json`
- `model_name`
- `status`（pending / completed / failed）
- `error_message`（nullable）
- `created_at`
- `completed_at`

### 5.7 recommendations（可選）
- `id` (PK)
- `user_id` (FK -> users.id)
- `paper_id` (FK -> papers.id)
- `reason`
- `score`
- `created_at`

---

## 6. API 設計（/api）

以下為建議 REST endpoints。

### 6.1 Authentication

- `POST /api/auth/register`
  - 建立帳號。
- `POST /api/auth/login`
  - 驗證帳密並回傳 token。
- `GET /api/auth/me`
  - 取得目前登入者資訊。
- `POST /api/auth/logout`（若採 token 黑名單時）

### 6.2 Paper Search / Detail

- `GET /api/papers`
  - 參數：`q`, `year`, `domain`, `venue`, `page`, `page_size`, `sort`
- `GET /api/papers/{paper_id}`
  - 取得論文詳情。
- `GET /api/papers/{paper_id}/related`
  - 取得相關論文（可選）。

### 6.3 Favorites

- `GET /api/favorites`
  - 取得我的收藏。
- `POST /api/favorites`
  - 加入收藏。
- `DELETE /api/favorites/{paper_id}`
  - 移除收藏。

### 6.4 Reading List

- `GET /api/reading-list`
  - 取得閱讀清單。
- `POST /api/reading-list`
  - 新增至閱讀清單。
- `PATCH /api/reading-list/{paper_id}`
  - 更新閱讀狀態、優先級、備註。
- `DELETE /api/reading-list/{paper_id}`
  - 從閱讀清單移除。

### 6.5 AI Analysis

- `POST /api/ai/analyze`
  - 請求對特定 paper 執行 AI 分析。
- `GET /api/ai/analysis/{paper_id}`
  - 取得該 paper 最新分析結果。
- `GET /api/ai/analysis/history`
  - 取得使用者分析歷史。

### 6.6 Recommendation

- `GET /api/recommendations`
  - 根據搜尋、收藏、閱讀行為回傳推薦清單。

---

## 7. 功能流程設計

### 7.1 Authentication Flow

1. 使用者註冊帳號。
2. 後端驗證 email 唯一性，儲存雜湊密碼。
3. 使用者登入取得 token。
4. 前端將 token 儲存在安全位置（建議 HttpOnly Cookie 或安全儲存策略）。
5. 受保護 API 需攜帶 token 才能存取。

### 7.2 Paper Search Flow

1. 前端送出關鍵字與篩選條件。
2. 後端組合查詢條件到 `papers`。
3. 回傳分頁結果（含總數、頁碼、卡片資料）。
4. 同步寫入 `search_history` 供推薦/分析使用。

### 7.3 Favorites Flow

1. 使用者在卡片或詳情頁點選收藏。
2. 後端驗證身份後新增 `favorites`。
3. 若已存在則回傳 idempotent 結果。
4. 收藏頁讀取 `favorites` + `papers` 組合資料。

### 7.4 Reading List Flow

1. 使用者將論文加入閱讀清單。
2. 後端寫入 `reading_list`，預設狀態 `unread`。
3. 使用者可更新狀態為 `reading` / `done`。
4. 前端依狀態分群顯示，支援排序與管理。

### 7.5 AI Analysis Flow

1. 使用者在論文詳情頁觸發分析。
2. 後端建立 `ai_analysis_results` 記錄（status=`pending`）。
3. AI 模組讀取 paper metadata（title/abstract/keywords）。
4. 生成內容：
   - 摘要（summary）
   - 研究方法（methodology）
   - 應用場景（applications）
   - 分類標籤（tags）
5. 寫回 `ai_analysis_results`（status=`completed`）。
6. 前端輪詢或重新載入顯示分析結果。

---

## 8. AI Analysis Module 設計細節

### 輸入
- 論文標題
- 論文摘要
- 關鍵字
- 領域、年份、會議等 metadata

### 輸出
- 結構化摘要
- 研究方法重點
- 可能應用情境
- 主題標籤（可多值）

### 模組元件（建議）

1. **Prompt Builder**：將論文內容轉為一致輸入格式。
2. **LLM Adapter**：封裝模型呼叫，方便替換模型供應商。
3. **Post-Processor**：將模型輸出正規化為固定欄位。
4. **Result Persistence**：寫入 `ai_analysis_results`。

### 可靠性策略

- 設定 timeout 與重試次數。
- 分析失敗需記錄 `error_message`。
- 對同一 paper 可採快取或版本化，避免重複計算。

---

## 9. 建議資料夾結構

```text
ai_research_platform/
├─ frontend/
│  ├─ src/
│  │  ├─ pages/
│  │  │  ├─ HomePage
│  │  │  ├─ AuthPage
│  │  │  ├─ PaperSearchPage
│  │  │  ├─ PaperDetailPage
│  │  │  ├─ FavoritesPage
│  │  │  ├─ ReadingListPage
│  │  │  └─ AIAnalysisPage
│  │  ├─ components/
│  │  │  ├─ paper/
│  │  │  ├─ auth/
│  │  │  └─ common/
│  │  ├─ services/
│  │  ├─ contexts/
│  │  ├─ hooks/
│  │  ├─ utils/
│  │  └─ router/
│  └─ public/
├─ backend/
│  ├─ app/
│  │  ├─ __init__.py
│  │  ├─ config.py
│  │  ├─ routes/
│  │  │  ├─ auth.py
│  │  │  ├─ papers.py
│  │  │  ├─ favorites.py
│  │  │  ├─ reading_list.py
│  │  │  ├─ ai_analysis.py
│  │  │  └─ recommendations.py
│  │  ├─ services/
│  │  │  ├─ auth_service.py
│  │  │  ├─ paper_service.py
│  │  │  ├─ library_service.py
│  │  │  ├─ ai_service.py
│  │  │  └─ recommendation_service.py
│  │  ├─ models/
│  │  ├─ repositories/
│  │  └─ ai_module/
│  │     ├─ prompt_builder.py
│  │     ├─ llm_adapter.py
│  │     └─ post_processor.py
│  ├─ migrations/
│  └─ tests/
├─ docs/
│  ├─ DESIGN.md
│  └─ ARCHITECT.md
└─ scripts/
```

> 註：目前專案可先將 `ARCHITECT.md` 置於根目錄，後續再整理進 `docs/`。

---

## 10. 非功能需求與實作建議

### 安全性
- 密碼僅儲存雜湊值。
- API 需驗證 token 與權限。
- 對登入與 AI 分析接口加上速率限制（Rate Limiting）。

### 效能
- `papers(year, domain, venue)` 建立索引以提升搜尋。
- 常用查詢（熱門論文、個人收藏）可快取。

### 可維運性
- API 回應格式統一（`success`, `data`, `error`）。
- 將業務邏輯與路由分離，維持可測試性。
- 補上單元測試與整合測試（auth、search、favorite、reading list、ai）。

### 可擴展性
- SQLite 可於後續升級至 PostgreSQL。
- AI 模組透過 adapter 抽象，便於替換模型。
- 推薦邏輯可從規則式演進到 embedding/向量檢索。

---

## 11. 交付結論

本架構完整覆蓋以下需求：
- 前端、後端、資料庫、API、AI 分析模組。
- 資料夾結構規劃。
- 主要資料表與欄位設計。
- API endpoints 清單。
- authentication、paper search、favorites、reading list、AI analysis 流程。

此設計可直接作為 MVP 實作藍圖，並保留後續擴展空間。

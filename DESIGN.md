# Introduction
這是一個 AI Research Paper Intelligence Platform，提供使用者搜尋、收藏、整理與分析近年 AI / 醫療 / 機器人相關論文。系統支援帳號登入、論文搜尋、摘要分析、標籤分類、閱讀清單管理與 AI 生成研究重點。
# Frontend
React + MUI
頁面：
首頁
註冊 / 登入
論文搜尋頁
論文詳情頁
我的收藏頁
閱讀清單頁
AI 分析頁
每篇 paper 顯示成卡片
可搜尋關鍵字、篩選年份、領域、會議
可加入收藏 / 閱讀清單
可查看 AI 摘要、研究方法、可能應用場景
# Backend
Flask
/api 開頭
SQLite 儲存使用者、收藏、閱讀紀錄、搜尋紀錄、AI 分析結果
提供論文查詢 API
提供 AI 摘要與分類 API
提供推薦 API
# 第 11 屆 iT 邦幫忙鐵人賽 自動發文機器人

## 用到的相關技術

* Google Cloud Platform
  * Cloud Functions (Node.js v10)
  * Pub/Sub
  * Cloud Scheduler
  * Stackdriver
* Google Spreadsheets

## 安裝

### 建立 Google Cloud Platform 專案

略

### 透過 Postman 查詢出發文所需的資料

請參考此篇文章：<https://ithelp.ithome.com.tw/articles/10191096>

* `ITHELP_COOKIE`: 只要登入後就可拿到，有效期 30 天，應該夠用
* `IRONMAN_ID`: 你希望機器人幫你發文的系列 ID
* `IRONMAN_TOKEN`: 從建立文章後表單中拿到的 `_token`

### 準備文章的資料來源 CSV

* 建立一個 Google Spreadsheets
* 確保上方的欄位有 `date,subject,tags,description`
* 「檔案」🡲「發布到網路」🡲「選擇你文章的資料表」🡲「逗號分隔值 (.csv)」🡲「發布」
* 複製 CSV 下載網址填到等等的 `ARTICLE_CSV`
* 請確保 csv 看起來應該像這樣

```csv
index,date,subject,tags,description
1,2019-09-16,DAY 1 前言,"[""vscode""]","# 這裡是內容

這裡是內文"
```

### 建立 Google Cloud Functions

* 名稱: 填你喜歡的就好
* 記憶體: `128 MB`
* 觸發條件: `Cloud Pub/Sub`
* 主題: 建立新主題，主題名稱填你喜歡的就好，在此設定為 `cron-every-day-1200`
* 執行階段: `Node.js 10`
* 在程式碼的 `index.js` 分頁內貼上 [index.js](index.js) 的所有程式碼
* 在程式碼的 `package.json` 分頁內貼上 [package.json](package.json) 的所有程式碼
* 要執行的函式: `main`
* 下方「環境變數、網路、逾時等」按一下
* 新增四個環境變數

```dotenv
ITHELP_COOKIE=
IRONMAN_ID=
IRONMAN_TOKEN=
ARTICLE_CSV=
```

* 建立
* 等候部署完成
* 到測試分頁，然後點選測試

### 建立 Google Cloud Scheduler

* 建立工作
* 區域跟你 Cloud Functions 同區，在此選擇 `us-central`
* 名稱: 你喜歡就好，在此填跟主題一樣 `cron-every-day-1200`
* 說明: 你喜歡就好，在此填 `每天中午十二點觸發一次`
* 頻率: `0 12 * * *`
* 時區: `香港`
* 目標: `Pub/Sub`
* 主題: `cron-every-day-1200`
* 酬載: `{}`

# 💧 水分補給トラッカー

Next.js + TypeScript + Tailwind CSS で作成された水分補給記録アプリです。クリーンアーキテクチャとDDD（ドメイン駆動設計）を採用しています。

## 🚀 機能

- **水分補給記録**: 量とメモを記録
- **クイック記録**: 200ml、300ml、500ml、750mlのボタンで素早く記録
- **日次サマリー**: 目標達成率と進捗の可視化
- **履歴表示**: 日付別の記録履歴
- **リマインダー機能**: 設定可能な時間間隔での通知
- **ローカルストレージ**: ブラウザでのデータ永続化
- **API対応**: 将来のバックエンド統合に対応した設計

## 🏗️ アーキテクチャ

### クリーンアーキテクチャ

```
src/
├── domain/                  # ドメイン層
│   ├── entities/           # エンティティ
│   ├── repositories/       # リポジトリインターフェース
│   └── value-objects/      # 値オブジェクト
├── application/            # アプリケーション層
│   └── use-cases/         # ユースケース
├── infrastructure/        # インフラストラクチャ層
│   ├── repositories/      # リポジトリ実装
│   └── di/               # 依存性注入コンテナ
└── presentation/          # プレゼンテーション層
    ├── components/        # UIコンポーネント
    └── pages/            # ページ
```

### ドメインモデル

- **User**: ユーザー情報と日次目標
- **HydrationRecord**: 水分補給記録
- **HydrationGoal**: 水分補給目標
- **DailyHydrationSummary**: 日次サマリー

## 🛠️ 技術スタック

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage（将来的にAPI対応）
- **Architecture**: Clean Architecture + DDD

## 📦 セットアップ

### 前提条件

- Node.js 18.0 以上
- npm または yarn

### インストール

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 🎯 使い方

### 基本的な使い方

1. **記録追加**: クイックボタンまたは手動入力で水分補給量を記録
2. **進捗確認**: 日次サマリーで目標達成率を確認
3. **履歴参照**: 過去の記録を日付別に確認
4. **リマインダー設定**: 通知間隔と時間帯を設定

### リマインダー機能

- 有効/無効の切り替え
- 通知間隔の設定（15分〜3時間）
- 通知時間帯の設定
- ブラウザ通知でのリマインド

## 🔧 開発

### ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
│   └── page.tsx           # メインページ
├── domain/                # ドメイン層
├── application/           # アプリケーション層
├── infrastructure/        # インフラ層
└── presentation/          # プレゼンテーション層
```

### 主要コンポーネント

- `HydrationForm`: 記録入力フォーム
- `DailySummary`: 日次進捗表示
- `HydrationHistory`: 履歴表示
- `ReminderSettings`: リマインダー設定
- `ReminderNotification`: 通知モーダル

## 🚀 API統合への準備

アプリケーションはAPI統合に対応した設計になっています：

### 使用方法

```typescript
// LocalStorage版（現在）
import { container } from '@/infrastructure/di/container';

// API版（将来）
import { apiContainer } from '@/infrastructure/di/ApiContainer';
```

### API Repository実装済み

- `ApiUserRepository`
- `ApiHydrationRecordRepository`  
- `ApiHydrationGoalRepository`

## 📱 レスポンシブ対応

- モバイル、タブレット、デスクトップに対応
- Tailwind CSSのレスポンシブ機能を活用
- タッチ操作に最適化されたUI

## 🎨 デザイン

- 清潔で直感的なUI
- 水をイメージした青を基調とした色彩
- アクセシビリティに配慮した設計

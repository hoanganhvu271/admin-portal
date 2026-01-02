# Wood Admin Portal

Giao diện quản trị thư viện gỗ - xây dựng với Vue 3 + TypeScript + Vuetify.

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vuetify 3
- Vue Router
- Vite
- Quill Editor

## Cài đặt

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## Cấu trúc thư mục

```
src/
├── api/          # API calls
├── components/   # Components dùng chung
├── models/       # TypeScript interfaces
├── plugins/      # Vuetify config
├── router/       # Vue Router
├── styles/       # CSS global
└── views/        # Pages
    ├── collections/  # Quản lý bộ sưu tập
    └── pieces/       # Quản lý mẫu gỗ
```

## Tính năng

- Quản lý bộ sưu tập gỗ (CRUD)
- Quản lý mẫu gỗ trong từng bộ sưu tập
- Upload hình ảnh lên Cloudinary
- Rich text editor cho mô tả
- Phân trang và tìm kiếm

## Cấu hình

API endpoint được cấu hình trong `src/api/index.ts`:

```typescript
const API_BASE = 'https://api.yolowood.click'
```

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server (port 3000) |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |

## Docker

```bash
docker build -t wood-admin-portal .
docker run -p 80:80 wood-admin-portal
```
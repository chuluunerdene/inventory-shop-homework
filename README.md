# Inventory Shop

`fullstack_daalgavar.docx` дээрх даалгаврын дагуу хийсэн `Next.js 16 + Prisma + PostgreSQL` fullstack project.

Энэ project нь:
- Бүтээгдэхүүн бүртгэх, засах, устгах
- Агуулахын үлдэгдэл нэмэх, хасах
- Нэр болон ангиллаар шүүх
- Client-side сагс
- Захиалга үүсгэх
- REST API, Joi validation, Prisma transaction, `next/image`, Vitest test

## Ашигласан технологи

- Next.js 16 App Router
- React 19
- Prisma 6
- PostgreSQL 14
- Joi validation
- `next/image`
- Vitest

## Архитектур

- UI нь `App Router` дээр ажиллана.
- Product CRUD болон inventory update нь `Route Handler` REST API ашиглана.
- Frontend нь эдгээр endpoint-ууд руу `fetch` ашиглаж холбогдоно.
- Product list, inventory list зэрэг анхны өгөгдөл нь `Server Components` дээр уншигдана.
- Form, cart, filter, toast зэрэг interactive хэсгүүд нь `Client Components` байна.
- Checkout нь Prisma transaction ашиглаж агуулахын тоо болон захиалгыг атомикаар шинэчилнэ.

## Гол route-ууд

- `/` - Бүтээгдэхүүний жагсаалт, хайлт, ангилал, pagination
- `/products/new` - Шинэ бараа бүртгэх
- `/products/[id]` - Барааны дэлгэрэнгүй
- `/products/[id]/edit` - Бараа засах
- `/inventory` - Агуулахын жагсаалт, үлдэгдэл нэмэх/хасах
- `/cart` - Сагс, захиалга

## REST API

### Products

- `GET /api/products?page=1`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Inventory

- `GET /api/inventory?page=1`
- `PATCH /api/inventory`

### Orders

- `POST /api/orders`

## Эхлүүлэх

### 1. Анхны setup

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm install
cp .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Апп нээх хаяг:

```bash
http://localhost:3000
```

### 2. Дараагийн удаа асаах

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm run db:up
npm run dev
```

### 3. Unit test ажиллуулах

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm test
```

### 4. Prisma schema өөрчлөгдсөн үед

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm run prisma:generate
npm run prisma:migrate -- --name your_migration_name
```

### 5. Seed дахин ажиллуулах

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm run prisma:seed
```

### 6. Docker DB command-ууд

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm run db:up
npm run db:logs
npm run db:down
```

### 7. Fresh reset жишээ

```bash
cd /Users/erk/Documents/private/homework/inventory-shop
npm run db:down
npm run db:up
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Хэрэв volume-оо хамт цэвэрлэх шаардлагатай бол:

```bash
docker compose down -v
```

## Postman

Import хийх collection file:

- [inventory-shop.postman_collection.json]

Collection дотор:
- Products API
- Inventory API
- Orders API

гэсэн бэлэн request-үүд байгаа.

## Seed өгөгдөл

- 2 ангилал: `Электроник`, `Хувцас`
- 6 бүтээгдэхүүн
- Зарим бүтээгдэхүүн нь low stock эсвэл 0 үлдэгдэлтэй

## Test

Одоогоор дараах хэсгүүд дээр unit test нэмсэн:

- [validation.test.ts]
- [app-errors.test.ts]

Шалгаж байгаа зүйлс:

- Product form validation
- Inventory adjustment validation
- Checkout validation
- Error normalization

## Bonus шаардлагууд

Одоогийн байдлаар дараах bonus-ууд хийгдсэн:

- Prisma transaction
- REST API + client `fetch`
- Joi validation
- `next/image`
- Vitest unit test

## Тэмдэглэл

- Үнэ нь `priceInCents` нэртэй талбарт хадгалагдана.
- Cart нь `localStorage` дээр хадгалагдана.
- Toast message-үүд UI дээр success/error байдлаар харагдана.
- Product зурагнууд `next/image` ашиглаж ачаалагдана.
- Checkout хийх үед агуулахын үлдэгдэл transaction дотор буурна.

## Environment

Default local тохиргоо:

```env
POSTGRES_DB=inventory_shop
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_shop?schema=public
```

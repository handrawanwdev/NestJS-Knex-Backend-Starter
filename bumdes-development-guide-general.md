# BoomDest Backend Development Guide — General

Dokumen ini adalah panduan umum development **boomdest-backend** agar struktur folder, naming, database, service, repository, migration, seed, Redis, queue, dan pola coding tetap konsisten.

Dokumen ini **bukan dokumentasi endpoint**, **bukan SRS detail**, dan **bukan panduan implementasi fitur per fitur**. Tujuan utama dokumen ini adalah mencegah programmer membuat struktur, table, file, module, service, atau endpoint secara asal-asalan.

> Stack database project ini menggunakan **KnexJS + PostgreSQL**.

---

## 1. Prinsip Umum Project

Project **boomdest-backend** menggunakan konsep:

- NestJS backend
- Modular monolith architecture sebagai standar awal
- KnexJS untuk query database
- PostgreSQL sebagai database utama
- Redis untuk cache, lock, queue, temporary state, dan job progress
- Worker untuk proses berat seperti aggregation, import/export, cleanup, report, dan background job
- Struktur modular mengikuti folder project existing

Setiap fitur baru wajib mengikuti pola:

```txt
controller -> service -> repository -> database
```

Aturan utama:

1. Controller hanya menerima request HTTP dan meneruskan payload ke service.
2. Service berisi business logic.
3. Repository hanya berisi query KnexJS.
4. DTO hanya untuk payload dan validasi.
5. Query database tidak boleh ditaruh di controller.
6. Business logic tidak boleh ditaruh di repository.
7. Gunakan KnexJS repository untuk semua akses database fitur baru.

---

## 2. Struktur Folder Project Existing

Struktur project existing mengikuti pola root backend seperti berikut:

```txt
boomdest-backend/
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── folder_path.txt
├── postman/
├── script-for-test/
├── src/
└── database/
```

Folder penting:

| Folder/File        | Fungsi                                 |
| ------------------ | -------------------------------------- |
| `src/`             | Source code utama backend              |
| `src/modules/`     | Semua module/domain fitur              |
| `postman/`         | Dokumentasi/request Postman per module |
| `database/`        | Knex config, migration, seed           |
| `script-for-test/` | Script bantuan development/testing     |
| `.env.example`     | Contoh environment variable            |
| `Dockerfile`       | Build image backend                    |

---

## 3. Struktur Folder `src/`

Struktur utama source code:

```txt
src/
├── app.module.ts
├── main.ts
├── config/
├── database/
├── common/
├── modules/
└── shared/
```

Rekomendasi fungsi folder:

| Folder      | Fungsi                                                   |
| ----------- | -------------------------------------------------------- |
| `config/`   | Konfigurasi env dan aplikasi                             |
| `database/` | Knex provider, database module, transaction helper       |
| `common/`   | Helper umum, response, exception, guard, decorator       |
| `modules/`  | Semua domain/module bisnis                               |
| `shared/`   | Shared utility lintas module, tanpa business logic berat |

Jangan menaruh logic bisnis fitur langsung di `common/` atau `shared/`.

---

## 4. Struktur Folder Module

Setiap fitur/domain di dalam `src/modules/` wajib mengikuti struktur ini:

```txt
src/modules/{module-name}/
├── {module-name}.module.ts
├── controllers/
│   └── {module-name}.controller.ts
├── services/
│   └── {module-name}.service.ts
├── repositories/
│   └── {module-name}.repository.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   └── update-{entity}.dto.ts
├── constants/
├── enums/
├── types/
└── mappers/
```

Contoh module auth:

```txt
src/modules/auth/
├── auth.module.ts
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── repositories/
│   └── auth.repository.ts
├── dto/
│   ├── login.dto.ts
│   ├── register-first-account.dto.ts
│   └── register-village-user.dto.ts
├── constants/
│   ├── auth-permission.constant.ts
│   └── auth-role.constant.ts
├── types/
└── mappers/
```

Contoh module village:

```txt
src/modules/villages/
├── villages.module.ts
├── controllers/
│   └── villages.controller.ts
├── services/
│   └── villages.service.ts
├── repositories/
│   └── villages.repository.ts
├── dto/
│   ├── create-village.dto.ts
│   └── update-village.dto.ts
├── constants/
├── types/
└── mappers/
```

Aturan:

1. Folder module menggunakan kebab-case atau plural yang konsisten.
2. Controller hanya menerima HTTP request dan meneruskan payload ke service.
3. Service hanya business logic.
4. Repository hanya query Knex.
5. DTO hanya payload dan validasi.
6. Mapper untuk format response jika response mulai kompleks.
7. Constant untuk status, role, permission, pattern, dan value tetap.
8. Jangan membuat folder acak seperti `logic/`, `handler-random/`, `db-query/`, atau `helper-feature` tanpa alasan kuat.

---

## 5. Aturan Repository KnexJS

Repository adalah satu-satunya tempat query database ditulis.

Contoh file:

```txt
src/modules/auth/repositories/auth.repository.ts
src/modules/users/repositories/users.repository.ts
src/modules/roles/repositories/roles.repository.ts
src/modules/villages/repositories/villages.repository.ts
```

Contoh pola repository:

```ts
import { Injectable } from "@nestjs/common";
import { Knex } from "knex";
import { InjectKnex } from "../../../database/decorators/inject-knex.decorator";

@Injectable()
export class AuthRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async findUserByEmail(email: string, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    return db("auth_user").where({ email }).whereNull("deleted_at").first();
  }

  async createUser(payload: Record<string, any>, trx?: Knex.Transaction) {
    const db = trx || this.knex;

    const [user] = await db("auth_user").insert(payload).returning("*");

    return user;
  }
}
```

Aturan repository:

1. Semua query database wajib di repository.
2. Repository tidak boleh hash password.
3. Repository tidak boleh membuat JWT.
4. Repository tidak boleh memutuskan business rule.
5. Repository boleh menerima `trx` dari service.
6. Repository harus menggunakan nama table yang konsisten.
7. Untuk query list, siapkan pagination dengan `limit` dan `offset`.
8. Untuk soft delete, gunakan `deleted_at`, bukan hard delete kecuali memang data log/temporary.
9. Untuk endpoint publik, repository harus menyediakan lookup berdasarkan `uuid`.
10. Untuk membuat relasi, repository/service harus memakai `id` internal hasil lookup dari `uuid`.

---

## 6. Aturan Service

Service berisi business logic dan orkestrasi.

Service boleh melakukan:

```txt
- validasi flow bisnis
- memanggil repository
- menjalankan transaction
- hash password
- membuat JWT
- memanggil Redis
- memanggil queue
- mengatur permission logic
- mengatur response bisnis
```

Service tidak boleh:

```txt
- menulis query Knex panjang langsung
- membuat SQL raw tanpa alasan jelas
- menerima request object mentah dari controller jika tidak perlu
- mengembalikan data sensitif seperti password_hash
```

Contoh transaction di service:

```ts
await this.knex.transaction(async (trx) => {
  const user = await this.authRepository.createUser(payload, trx);
  await this.authRepository.assignRole(user.id, roleId, trx);
  return user;
});
```

---

## 7. Aturan Controller

Controller hanya menerima request dan meneruskan payload ke service.

Controller tidak boleh:

```txt
- query database langsung
- menjalankan Knex langsung
- hash password
- membuat JWT langsung
- melakukan transaction langsung
- membuat business logic panjang
```

Contoh controller yang benar:

```ts
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

---

## 8. Aturan DTO

DTO digunakan untuk validasi bentuk payload.

Contoh:

```txt
login.dto.ts
register-first-account.dto.ts
register-village-user.dto.ts
create-village.dto.ts
update-village.dto.ts
assign-user-role.dto.ts
assign-role-permission.dto.ts
```

Aturan DTO:

1. DTO tidak boleh query database.
2. DTO tidak boleh business logic.
3. DTO tidak boleh akses Redis/queue.
4. DTO harus diberi nama sesuai fungsi.
5. Gunakan class-validator jika tersedia di project.

---

## 9. Aturan Database Naming

Penamaan table wajib konsisten dan mengikuti domain.

Gunakan format:

```txt
{domain}_{entity}
```

Contoh benar:

```txt
auth_user
auth_role
auth_permission
auth_role_permission
auth_user_role
auth_session

village
village_profile
village_setting

destination
destination_category
destination_gallery

booking
booking_ticket
booking_visitor

payment_invoice
payment_transaction
payment_callback

report_booking_daily
worker_job_log
```

Table awal project:

```txt
auth_user
auth_role
auth_permission
auth_role_permission
auth_user_role
village
```

Jangan gunakan:

```txt
users
roles
permissions
userRoles
role_permission_table
tbl_user
m_user
data_login
```

---

## 10. Aturan Column Database

Column wajib menggunakan `snake_case`.

Contoh benar:

```txt
id
full_name
email
phone
password_hash
village_id
created_by
updated_by
deleted_by
created_at
updated_at
deleted_at
last_login_at
is_first_account
```

Contoh salah:

```txt
fullName
phoneNumber
passwordHash
createdAt
updatedAt
isFirstAccount
```

---

## 11. Primary Key, UUID Publik, dan Foreign Key

Semua table utama wajib memiliki dua identifier:

```txt
id   -> primary key internal, serial/bigserial angka
uuid -> public identifier untuk endpoint/API
```

Aturan `id`:

1. `id` wajib berupa angka auto-increment, disarankan `bigserial`/`bigIncrements`.
2. `id` dipakai untuk primary key internal database.
3. `id` dipakai untuk foreign key antar table agar indexing lebih rapi dan berurutan.
4. `id` tidak dipakai sebagai parameter endpoint publik.
5. `id` tidak perlu diexpose ke response frontend kecuali benar-benar untuk kebutuhan internal admin/debug.

Aturan `uuid`:

1. `uuid` wajib ada di semua table utama.
2. `uuid` wajib unique dan default `gen_random_uuid()`.
3. `uuid` dipakai untuk endpoint, request body, response publik, dan referensi dari frontend.
4. Semua endpoint detail/update/delete memakai `uuid`, bukan `id`.
5. Service/repository wajib melakukan lookup `uuid` ke `id` sebelum membuat relasi database.

Contoh endpoint yang benar:

```txt
GET    /users/:uuid
PATCH  /users/:uuid
DELETE /users/:uuid
GET    /villages/:uuid
```

Foreign key tetap menggunakan format:

```txt
{entity}_id
```

Contoh foreign key internal:

```txt
user_id
role_id
permission_id
village_id
booking_id
payment_id
created_by
updated_by
deleted_by
```

Contoh relasi:

```txt
auth_user.id -> auth_user_role.user_id
auth_role.id -> auth_user_role.role_id
auth_permission.id -> auth_role_permission.permission_id
village.id -> auth_user.village_id
```

Contoh payload publik:

```json
{
  "user_uuid": "public-user-uuid",
  "role_uuid": "public-role-uuid",
  "village_uuid": "public-village-uuid"
}
```

Repository kemudian mencari `id` internal berdasarkan `uuid` tersebut sebelum insert/update relasi.

---

## 12. Timestamp, Soft Delete, dan Audit

Setiap table utama wajib memiliki:

```txt
created_at
updated_at
```

Jika data bisa dihapus secara soft delete, tambahkan:

```txt
deleted_at
```

Jika butuh audit user, tambahkan:

```txt
created_by
updated_by
deleted_by
```

Aturan:

1. Jangan menghapus data penting secara hard delete.
2. Untuk delete biasa gunakan update `deleted_at`.
3. Query list/detail wajib filter `whereNull('deleted_at')` jika table mendukung soft delete.

---

## 13. Aturan Status

Status wajib lowercase dan konsisten.

Contoh:

```txt
active
inactive
suspended
pending
paid
failed
expired
refunded
approved
rejected
in_review
resolved
```

Jangan gunakan:

```txt
ACTIVE
Aktif
Non Aktif
PaidSuccess
non-active
```

Aturan:

1. Gunakan lowercase.
2. Gunakan underscore jika lebih dari satu kata.
3. Jangan campur bahasa Indonesia dan Inggris dalam value status.
4. Jangan membuat status baru tanpa kebutuhan bisnis yang jelas.

---

## 14. Aturan Naming File, Class, Variable

File wajib kebab-case.

Contoh benar:

```txt
auth.service.ts
auth.controller.ts
auth.repository.ts
register-first-account.dto.ts
register-village-user.dto.ts
assign-role-permission.dto.ts
```

Class wajib PascalCase.

Contoh:

```ts
AuthService;
AuthController;
AuthRepository;
RegisterFirstAccountDto;
```

Variable dan function wajib camelCase.

Contoh:

```ts
const userId = "";
const villageId = "";

async function registerFirstAccount() {}
async function registerVillageUser() {}
```

Jangan gunakan:

```ts
const user_id = "";
const VillageId = "";
function RegisterUser() {}
```

---

## 15. Aturan Migration KnexJS

Migration disimpan di:

```txt
database/migrations/
```

Contoh struktur:

```txt
database/
├── knexfile.ts
├── migrations/
│   ├── 202605060001_create_auth_user_table.ts
│   ├── 202605060002_create_auth_role_table.ts
│   ├── 202605060003_create_auth_permission_table.ts
│   ├── 202605060004_create_auth_role_permission_table.ts
│   ├── 202605060005_create_auth_user_role_table.ts
│   └── 202605060006_create_village_table.ts
└── seeds/
    ├── 001_seed_auth_role.ts
    ├── 002_seed_auth_permission.ts
    └── 003_seed_auth_role_permission.ts
```

Contoh migration Knex:

```ts
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("auth_user", (table) => {
    table.bigIncrements("id").primary();
    table
      .uuid("uuid")
      .notNullable()
      .unique()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.string("full_name").notNullable();
    table.string("email").notNullable().unique();
    table.string("phone").nullable();
    table.string("password_hash").notNullable();
    table
      .bigInteger("village_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("village");
    table.string("status").notNullable().defaultTo("active");
    table.boolean("is_first_account").notNullable().defaultTo(false);
    table
      .bigInteger("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("auth_user");
    table
      .bigInteger("updated_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("auth_user");
    table
      .bigInteger("deleted_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("auth_user");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("deleted_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("auth_user");
}
```

Aturan migration:

1. Nama migration harus jelas dan berurutan.
2. Migration wajib punya `up` dan `down`.
3. Jangan mengubah migration lama yang sudah jalan di environment lain.
4. Perubahan table wajib migration baru.
5. Jangan membuat column camelCase.
6. Jangan membuat table tanpa timestamp untuk table utama.
7. Foreign key wajib jelas.
8. Index ditambahkan jika field sering dipakai filter/search.
9. Table utama wajib punya `id` bigserial sebagai primary key internal.
10. Table utama wajib punya `uuid` unique sebagai public identifier.
11. Foreign key memakai `id` angka, bukan `uuid`.

---

## 16. Aturan Seed KnexJS

Seed disimpan di:

```txt
database/seeds/
```

Seed awal yang wajib ada:

```txt
001_seed_auth_role.ts
002_seed_auth_permission.ts
003_seed_auth_role_permission.ts
```

Seed digunakan untuk:

```txt
super_admin
village_admin
village_staff
permission dasar
mapping role permission
```

Contoh role dasar:

```txt
super_admin
village_admin
village_staff
```

Contoh permission dasar:

```txt
village:create
village:read
village:update
village:delete

user:create
user:read
user:update
user:delete

role:read
role:assign
permission:read

dashboard:read
report:read
```

Aturan seed:

1. Seed harus aman dijalankan ulang jika memungkinkan.
2. Gunakan `onConflict().ignore()` atau pengecekan existing data jika perlu.
3. Jangan seed user admin dengan password hardcode di production.
4. Seed role system tidak boleh asal dihapus.

---

## 17. Aturan Auth Flow

### Register akun pertama

Jika data row di table `auth_user` per desa masih kosong , user pertama otomatis menjadi:

```txt
super_admin
```

Aturan:

1. Hanya bisa dilakukan jika belum ada user.
2. User pertama tidak wajib memiliki `village_id`.
3. User pertama otomatis mendapat role `super_admin`.
4. Setelah user pertama dibuat, register pertama ditutup.
5. Gunakan Redis lock agar tidak terjadi race condition.

Redis lock:

```txt
boomdest:lock:register:first-account
```

### Register setelah login

Jika sudah ada user, pembuatan user berikutnya dilakukan setelah login.

Aturan:

1. Harus dilakukan oleh user yang sudah login.
2. User baru adalah user desa.
3. User desa wajib memiliki `village_id`.
4. Role yang diberikan bukan `super_admin`.
5. Role yang boleh diberikan misalnya `village_admin` atau `village_staff`.
6. Field `created_by` diisi user pembuat.
7. User desa wajib dibatasi sesuai `village_id` pembuat.

---

## 18. Aturan Role dan Permission

Role dasar:

```txt
super_admin
village_admin
village_staff
```

Permission wajib menggunakan format:

```txt
{module}:{action}
```

Contoh:

```txt
village:create
village:read
village:update
village:delete
user:create
user:read
role:assign
permission:read
dashboard:read
report:read
```

Aturan:

1. Role menggunakan lowercase dan underscore.
2. Permission menggunakan format `module:action`.
3. Permission tidak boleh dibuat bebas tanpa standar.
4. Role system tidak boleh dihapus sembarangan.
5. Super admin memiliki akses penuh.
6. Semua route penting wajib dikunci permission.

---

## 19. Aturan Postman Folder

Project existing memiliki folder `postman/collections/`.

Untuk request baru, dokumentasi Postman mengikuti folder module.

Contoh:

```txt
postman/collections/BoomDest API/Authentication/
postman/collections/BoomDest API/Villages/
postman/collections/BoomDest API/Users/
postman/collections/BoomDest API/Roles/
postman/collections/BoomDest API/Permissions/
```

Aturan:

1. Folder Postman harus sesuai nama module/domain.
2. Nama request harus jelas, contoh `Login.request.yaml`, `Create Village.request.yaml`.
3. Pisahkan request admin dan user jika flow berbeda.
4. Jangan menaruh semua request dalam satu folder besar.

---

## 20. Aturan Environment Variable

Gunakan uppercase dan underscore.

Contoh:

```env
APP_NAME=boomdest-backend
APP_ENV=development
APP_PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=boomdest

REDIS_HOST=localhost
REDIS_PORT=6379

QUEUE_PREFIX=boomdest

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
```

Jangan gunakan:

```env
dbHost=localhost
redis-host=localhost
jwtSecret=secret
```

---

## 21. Aturan Redis

Redis digunakan untuk:

```txt
cache
lock
queue
temporary state
rate limit
job progress
session/token blacklist jika dibutuhkan
```

Redis key wajib prefix:

```txt
boomdest
```

Contoh:

```txt
boomdest:cache:auth:user:{user_id}
boomdest:lock:register:first-account
boomdest:job:progress:{job_id}
boomdest:session:{user_id}
boomdest:rate-limit:login:{ip}
```

Aturan:

1. Redis key wajib memiliki prefix `boomdest`.
2. Cache wajib punya TTL jika bukan data permanen.
3. Lock wajib punya TTL.
4. Jangan membuat key random tanpa format.
5. Jangan simpan data sensitif mentah jika tidak perlu.

---

## 22. Aturan Queue dan Worker

Worker digunakan untuk proses berat.

Contoh proses yang masuk worker:

```txt
aggregation
report export
data import
cleanup expired data
audit log async
user activity processing
job progress processing
```

Aturan:

1. Jangan menjalankan proses berat di controller.
2. Jangan membuat request HTTP menunggu proses besar selesai.
3. Gunakan queue untuk background process.
4. Simpan progress job jika proses lama.
5. Worker harus idempotent dan aman jika job retry.
6. Job failure harus tercatat di log.

---

## 23. Aturan Response

Response sukses:

```json
{
  "status": 200,
  "message": "Success",
  "data": {}
}
```

Response error:

```json
{
  "status": 400,
  "message": "Bad Request",
  "data": null,
  "error": "Validation error"
}
```

Aturan:

1. Response harus konsisten di semua module.
2. Response list sebaiknya memiliki pagination.
3. Error harus jelas tetapi tidak membocorkan stack trace.
4. Jangan expose `password_hash`, token internal, secret, atau data sensitif.

---

## 24. Aturan Security

Aturan minimal:

1. Password wajib di-hash.
2. Jangan simpan password asli.
3. JWT secret wajib dari env.
4. Endpoint internal tidak boleh dibuka publik.
5. Super admin tidak boleh dibuat dari register user biasa.
6. User desa wajib dibatasi berdasarkan `village_id`.
7. Jangan expose stack trace ke frontend.
8. Jangan hardcode secret di source code.
9. Semua route penting wajib dicek permission.
10. Query search/filter harus aman dari SQL injection dengan binding/Knex query builder.

---

## 25. Enhancement Ke Depan: Upgrade ke Service Terpisah

Standar saat ini adalah **modular monolith**. Semua fitur utama dibuat di `src/modules/` terlebih dahulu.

Service terpisah hanya dibuat jika nanti skala project sudah membutuhkan pemisahan proses, deployment, atau domain yang benar-benar besar. Jadi bagian ini bersifat **opsional untuk pengembangan ke depan**, bukan kewajiban pada fase awal.

Jika nanti project di-upgrade menjadi service terpisah, struktur folder yang disarankan:

```txt
apps/
├── api-gateway/
├── auth-service/
├── village-service/
├── destination-service/
├── booking-service/
├── payment-service/
├── report-service/
└── worker-service/

libs/
├── common/
├── config/
├── database/
├── redis/
├── queue/
├── clients/
├── contracts/
└── logger/
```

Aturan enhancement:

1. Fitur sederhana tetap cukup menjadi module di `src/modules/`.
2. Service terpisah hanya untuk domain besar atau proses yang memang perlu dipisah.
3. `apps/` digunakan untuk aplikasi/service yang bisa berjalan sendiri.
4. `libs/` digunakan untuk shared code lintas service.
5. Contract antar service disimpan di `libs/contracts`.
6. Client antar service disimpan di `libs/clients`.
7. Provider database bersama disimpan di `libs/database`.
8. Provider Redis bersama disimpan di `libs/redis`.
9. Proses berat tetap diarahkan ke worker/queue.

---

## 26. Aturan Saat Membuat CRUD/Module Baru

Jika membuat CRUD/module baru, minimal buat file:

```txt
src/modules/{module-name}/
├── controllers/
│   └── {module-name}.controller.ts
├── services/
│   └── {module-name}.service.ts
├── repositories/
│   └── {module-name}.repository.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   └── update-{entity}.dto.ts
├── constants/
├── types/
└── mappers/
```

Jika butuh database, tambahkan:

```txt
database/migrations/{timestamp}_create_{table_name}_table.ts
database/seeds/{number}_seed_{table_name}.ts
```

Jika butuh Postman, tambahkan:

```txt
postman/collections/BoomDest API/{Module Name}/
```

Aturan CRUD:

1. Table harus sesuai format `{domain}_{entity}` jika perlu prefix domain.
2. Column harus snake_case.
3. Repository harus pakai Knex.
4. Service harus handle business rule.
5. Controller hanya route/payload.
6. Route wajib diberi guard/permission jika bukan public.
7. Response wajib konsisten.
8. Endpoint detail/update/delete wajib memakai `uuid`, bukan `id`.
9. Response publik sebaiknya menampilkan `uuid`, bukan `id` internal.

---

## 27. Hal yang Tidak Boleh Dilakukan

Jangan lakukan:

```txt
- menaruh query Knex di controller
- membuat table tanpa standar nama
- membuat column camelCase
- membuat service tanpa domain jelas
- menaruh business logic besar di repository
- menaruh query panjang di service
- menulis permission tanpa format module:action
- membuat status campur bahasa
- membuat Redis key tanpa prefix boomdest
- membuat migration tanpa up/down
- mengubah migration lama yang sudah jalan
- menyimpan password plain text
- hardcode JWT secret
- membuat super_admin dari endpoint user biasa
- membuka endpoint internal ke publik tanpa guard
```

---

## 28. Standar Awal Project BoomDest

Fokus table awal:

```txt
auth_user
auth_role
auth_permission
auth_role_permission
auth_user_role
village
```

Fokus role awal:

```txt
super_admin
village_admin
village_staff
```

Fokus flow awal:

```txt
register akun pertama -> super_admin
login
register setelah login -> user desa
manage user role
manage role permission
protect route by permission
```

Fokus folder awal:

```txt
src/modules/auth/
src/modules/users/
src/modules/roles/
src/modules/permissions/
src/modules/villages/
database/migrations/
database/seeds/
postman/collections/BoomDest API/
```

---

## 29. Penutup

Panduan ini menjadi standar umum development **boomdest-backend**.

Setiap programmer wajib mengikuti aturan naming, struktur module, database table, migration, seed, Redis key, repository KnexJS, response, dan permission agar project tetap mudah dirawat saat fitur bertambah. Struktur default project saat ini adalah modular monolith, dengan opsi upgrade service terpisah sebagai enhancement ke depan.

Untuk fitur baru, gunakan **KnexJS repository** dan public identifier `uuid` untuk endpoint/API.

# Panduan Script Development dan CLI Generator

Dokumen ini menjelaskan standar penggunaan script `npm`, Knex migration/seed, dan CLI generator pada project **bumdes-backend / boomdest-backend**.

Panduan ini dibuat agar developer tidak membuat struktur file, migration, seed, CRUD module, atau worker processor secara asal-asalan.

---

## 1. Script Wajib di `package.json`

Tambahkan script berikut pada bagian `scripts` di `package.json`.

```json
{
  "scripts": {
    "knex:status": "knex migrate:status --knexfile src/database/knexfile.ts",
    "knex:migrate": "knex migrate:latest --knexfile src/database/knexfile.ts",
    "knex:rollback": "knex migrate:rollback --knexfile src/database/knexfile.ts",
    "knex:seed": "knex seed:run --knexfile src/database/knexfile.ts",

    "make:crud": "ts-node cli/make-crud.ts",
    "make:table": "ts-node cli/make-table.ts",
    "make:seed": "ts-node cli/make-seed.ts",
    "make:job-processor": "ts-node cli/make-job-processor.ts"
  }
}
```

---

## 2. Script Knex

Script Knex digunakan untuk mengelola migration dan seed database PostgreSQL.

### 2.1 Cek Status Migration

```bash
npm run knex:status
```

Digunakan untuk melihat daftar migration yang sudah atau belum dijalankan.

---

### 2.2 Jalankan Migration

```bash
npm run knex:migrate
```

Digunakan untuk menjalankan semua migration yang belum dijalankan.

Migration wajib disimpan sesuai konfigurasi `migrations.directory` pada:

```txt
src/database/knexfile.ts
```

Contoh folder migration:

```txt
src/database/migrations/
```

Aturan migration:

- Nama migration harus jelas dan berurutan.
- Migration wajib memiliki function `up` dan `down`.
- Jangan mengubah migration lama yang sudah pernah dijalankan.
- Jika ada perubahan struktur table, buat migration baru.
- Table wajib menggunakan `snake_case`.
- Column wajib menggunakan `snake_case`.
- Table utama wajib memiliki `id`, `uuid`, `created_at`, dan `updated_at`.
- Jika table mendukung soft delete, tambahkan `deleted_at`.

---

### 2.3 Rollback Migration

```bash
npm run knex:rollback
```

Digunakan untuk membatalkan batch migration terakhir.

Gunakan rollback dengan hati-hati, terutama jika database sudah berisi data penting.

---

### 2.4 Jalankan Seed

```bash
npm run knex:seed
```

Digunakan untuk menjalankan seed awal seperti role, permission, role permission, atau data master lain.

Seed wajib disimpan sesuai konfigurasi `seeds.directory` pada:

```txt
src/database/knexfile.ts
```

Contoh folder seed:

```txt
src/database/seeds/
```

Aturan seed:

- Seed harus aman dijalankan ulang.
- Gunakan `onConflict().ignore()` jika memungkinkan.
- Jangan seed password production secara hardcode.
- Seed role system tidak boleh asal dihapus.
- Untuk mapping table, gunakan conflict gabungan.

Contoh seed table master:

```ts
await knex('auth_role')
  .insert(rows)
  .onConflict('name')
  .ignore();
```

Contoh seed mapping table:

```ts
await knex('auth_role_permission')
  .insert(rows)
  .onConflict(['role_id', 'permission_id'])
  .ignore();
```

---

## 3. CLI `make:crud`

CLI ini digunakan untuk membuat struktur CRUD module secara otomatis.

### Command

```bash
npm run make:crud {module-name}
```

Contoh:

```bash
npm run make:crud village-profile
```

Output minimal:

```txt
src/modules/village-profile/
├── controllers/
│   └── village-profile.controller.ts
├── services/
│   └── village-profile.service.ts
├── repositories/
│   └── village-profile.repository.ts
├── dto/
│   ├── create-village-profile.dto.ts
│   └── update-village-profile.dto.ts
├── constants/
├── types/
└── mappers/
```

Aturan hasil generate:

- File wajib menggunakan `kebab-case`.
- Class wajib menggunakan `PascalCase`.
- Variable dan function wajib menggunakan `camelCase`.
- Controller hanya menerima request dan meneruskan payload ke service.
- Service berisi business logic.
- Repository hanya untuk query Knex.
- DTO hanya untuk payload dan validasi.
- Endpoint detail/update/delete wajib menggunakan `uuid`, bukan `id`.
- Response publik sebaiknya tidak menampilkan `id` internal.

Jika module sudah memiliki `{module-name}.module.ts`, maka `app.module.ts` cukup import module tersebut.

Contoh benar:

```ts
@Module({
  imports: [VillageProfileModule],
})
export class AppModule {}
```

Contoh yang harus dihindari:

```ts
@Module({
  controllers: [VillageProfileController],
  providers: [VillageProfileService, VillageProfileRepository],
})
export class AppModule {}
```

---

## 4. CLI `make:table`

CLI ini digunakan untuk membuat migration table dasar secara otomatis.

### Command

```bash
npm run make:table {table-name}
```

Contoh:

```bash
npm run make:table village-profile
```

Hasil table:

```txt
village_profile
```

Output file:

```txt
src/database/migrations/{timestamp}_create_village_profile_table.ts
```

Template table minimal:

```txt
id
uuid
name
description
status
created_at
updated_at
deleted_at
```

Aturan table:

- Table wajib menggunakan `snake_case`.
- Table domain disarankan menggunakan format `{domain}_{entity}`.
- Table utama wajib memiliki `id` sebagai primary key internal.
- Table utama wajib memiliki `uuid` sebagai public identifier.
- Endpoint/API menggunakan `uuid`, bukan `id`.
- Foreign key menggunakan format `{entity}_id`.
- Status menggunakan lowercase dan underscore.
- Data penting menggunakan soft delete dengan `deleted_at`.

Contoh nama table benar:

```txt
auth_user
auth_role
auth_permission
auth_role_permission
auth_user_role
village
village_profile
worker_job_log
```

Contoh nama table salah:

```txt
users
roles
userRoles
role_permission_table
tbl_user
m_user
```

Catatan:

CLI `make:table` hanya membuat template awal. Developer tetap wajib menyesuaikan kolom berdasarkan kebutuhan bisnis sebelum migration dijalankan.

---

## 5. CLI `make:seed`

CLI ini digunakan untuk membuat file seed baru secara otomatis.

### Command

```bash
npm run make:seed {seed-name}
```

Contoh:

```bash
npm run make:seed auth-role
```

Output:

```txt
src/database/seeds/001_seed_auth-role.ts
```

Seed digunakan untuk:

```txt
role dasar
permission dasar
mapping role permission
data master awal
data referensi sistem
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

- Seed harus aman dijalankan ulang.
- Jangan seed password production secara hardcode.
- Gunakan `onConflict().ignore()` jika memungkinkan.
- Untuk mapping table, gunakan conflict gabungan.
- Seed data system seperti role dan permission tidak boleh dibuat asal-asalan.

Contoh untuk table master:

```ts
await knex('auth_role')
  .insert(rows)
  .onConflict('name')
  .ignore();
```

Contoh untuk mapping table:

```ts
await knex('auth_role_permission')
  .insert(rows)
  .onConflict(['role_id', 'permission_id'])
  .ignore();
```

---

## 6. CLI `make:job-processor`

CLI ini digunakan untuk membuat worker processor baru secara otomatis.

### Command

```bash
npm run make:job-processor {job-name}
```

Contoh:

```bash
npm run make:job-processor test-log
```

Output:

```txt
src/workers/processors/test-log.processor.ts
```

Class yang dibuat:

```txt
TestLogProcessor
```

Job name yang dibuat:

```txt
test_log
```

CLI ini wajib melakukan tiga hal:

1. Membuat file processor ke `src/workers/processors/`.
2. Menambahkan processor ke `src/workers/workers.module.ts`.
3. Menambahkan job constant ke `src/workers/constants/worker-job.constant.ts`.

Contoh hasil update constant:

```ts
export const WORKER_JOB = {
  DEFAULT_TEST: 'default.test',

  REPORT_GENERATE_DAILY: 'report.generate_daily',
  REPORT_EXPORT: 'report.export',

  DATA_IMPORT: 'data.import',
  DATA_EXPORT: 'data.export',

  CLEANUP_EXPIRED_DATA: 'cleanup.expired_data',
  AUDIT_LOG_ASYNC: 'audit.log_async',

  TEST_LOG: 'test_log',
} as const;

export type WorkerJob = (typeof WORKER_JOB)[keyof typeof WORKER_JOB];
```

Aturan worker:

- Worker digunakan untuk proses berat atau background process.
- Jangan menjalankan proses berat langsung di controller.
- Job harus idempotent karena bisa retry.
- Job failure harus tercatat di log.
- Queue menggunakan Redis.
- Queue prefix wajib menggunakan `boomdest`.
- Job name menggunakan lowercase dan underscore atau format domain action yang konsisten.
- Processor tidak boleh berisi logic acak tanpa domain yang jelas.

Contoh job name:

```txt
report.generate_daily
report.export
data.import
data.export
cleanup.expired_data
audit.log_async
test_log
```

---

## 7. Urutan Penggunaan CLI yang Disarankan

Untuk membuat fitur/module baru yang membutuhkan database:

```bash
npm run make:crud village-profile
npm run make:table village-profile
npm run make:seed village-profile
npm run knex:migrate
npm run knex:seed
```

Untuk membuat worker processor baru:

```bash
npm run make:job-processor report-export
```

Setelah itu, panggil job dari service menggunakan `QueueService`.

Contoh:

```ts
await this.queueService.addDefaultJob(WORKER_JOB.REPORT_EXPORT, {
  job_name: WORKER_JOB.REPORT_EXPORT,
  requested_by: userId,
  payload: {
    report_type: 'booking_daily',
  },
});
```

---

## 8. Catatan Knexfile

Karena script menggunakan:

```json
"knex:migrate": "knex migrate:latest --knexfile src/database/knexfile.ts"
```

maka pastikan file berikut tersedia:

```txt
src/database/knexfile.ts
```

Dan pastikan konfigurasi migration serta seed mengarah ke folder yang benar.

Contoh jika migration dan seed ada di dalam `src/database`:

```ts
migrations: {
  directory: './src/database/migrations',
  extension: 'ts',
},
seeds: {
  directory: './src/database/seeds',
  extension: 'ts',
},
```

Jika migration dan seed ada di root `database`, maka sesuaikan:

```ts
migrations: {
  directory: './database/migrations',
  extension: 'ts',
},
seeds: {
  directory: './database/seeds',
  extension: 'ts',
},
```

Jangan sampai script menunjuk ke `src/database/knexfile.ts`, tetapi migration directory mengarah ke folder yang tidak ada.

---

## 9. Catatan Penting

Semua CLI generator hanya membantu membuat struktur awal.

Developer tetap wajib menyesuaikan:

- kolom migration
- DTO validation
- business logic service
- query repository
- permission route
- response mapper
- seed rows
- job processor logic
- index database
- relasi foreign key

Jangan langsung menjalankan migration sebelum memastikan kolom table sudah sesuai kebutuhan bisnis.

Jangan menaruh query database di controller.

Jangan menaruh business logic panjang di repository.

Jangan membuat worker untuk proses ringan yang masih aman dijalankan langsung oleh service.

Gunakan CLI agar struktur file tetap konsisten, bukan untuk menggantikan review logic dan desain database.

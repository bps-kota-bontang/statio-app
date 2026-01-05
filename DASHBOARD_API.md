# Dashboard API Specification

## Overview
API endpoint untuk mendukung dashboard pemantauan pengisian data statistik BPS 2026.

## Endpoint

### GET `/api/v1/dashboard/summary`

Mengembalikan ringkasan lengkap untuk dashboard, termasuk statistik, tren, dan aktivitas terbaru.

#### Query Parameters
- `year` (optional, number): Tahun data yang ingin ditampilkan (default: tahun berjalan)
- `organization_id` (optional, string): Filter untuk organisasi tertentu (untuk view operator)

#### Response Format

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "overall": {
      "total_tables": 120,
      "completed_tables": 90,
      "in_progress_tables": 20,
      "draft_tables": 10,
      "organizations_count": 15,
      "change_vs_last_month": {
        "total": "+12%",
        "completed": "+8%",
        "in_progress": "-5%"
      }
    },
    "month_trend": [
      {
        "month": "2026-01",
        "submitted": 30,
        "finalized": 20,
        "target": 40,
        "percentage": 75
      },
      {
        "month": "2026-02",
        "submitted": 35,
        "finalized": 28,
        "target": 40,
        "percentage": 88
      }
    ],
    "status_distribution": [
      {
        "status": "finalized",
        "count": 90,
        "percentage": 75
      },
      {
        "status": "submitted",
        "count": 20,
        "percentage": 17
      },
      {
        "status": "draft",
        "count": 10,
        "percentage": 8
      }
    ],
    "organizations_completion": [
      {
        "organization_id": "org-1",
        "organization_name": "Dinas Kesehatan",
        "total_tables": 12,
        "completed_tables": 11,
        "finalized_tables": 10,
        "normalized_score": 95
      },
      {
        "organization_id": "org-2",
        "organization_name": "Dinas Pendidikan",
        "total_tables": 10,
        "completed_tables": 9,
        "finalized_tables": 8,
        "normalized_score": 88
      }
    ],
    "performance_ranking": [
      {
        "organization_id": "org-1",
        "organization_name": "Dinas Kesehatan",
        "rank": 1,
        "avg_submission_days": 2.3,
        "normalized_score": 95
      },
      {
        "organization_id": "org-2",
        "organization_name": "Dinas Pendidikan",
        "rank": 2,
        "avg_submission_days": 3.1,
        "normalized_score": 90
      }
    ],
    "quality_flags": {
      "tables_with_outliers": 7,
      "tables_with_missing": 12,
      "tables_with_revisions": 5
    },
    "recent_activities": [
      {
        "id": "activity-1",
        "timestamp": "2026-01-05T10:15:00Z",
        "organization_name": "Dinas Kesehatan",
        "table_name": "Data Kesehatan Q4 2025",
        "action": "finalized",
        "actor_role": "admin",
        "actor_name": "Admin BPS"
      },
      {
        "id": "activity-2",
        "timestamp": "2026-01-05T09:10:00Z",
        "organization_name": "Dinas Pendidikan",
        "table_name": "Data Pendidikan 2026",
        "action": "submitted",
        "actor_role": "operator",
        "actor_name": "Operator Pendidikan"
      },
      {
        "id": "activity-3",
        "timestamp": "2026-01-04T16:30:00Z",
        "organization_name": "Dinas Pekerjaan Umum",
        "table_name": "Data Infrastruktur",
        "action": "revised",
        "actor_role": "operator",
        "actor_name": "Operator PU"
      },
      {
        "id": "activity-4",
        "timestamp": "2026-01-04T14:20:00Z",
        "organization_name": "Dinas Sosial",
        "table_name": "Data Sosial Q1",
        "action": "returned",
        "actor_role": "admin",
        "actor_name": "Admin BPS"
      }
    ]
  }
}
```

## Business Logic Notes

### Normalized Score Calculation
Score dinormalisasi untuk `organizations_completion` dan `performance_ranking` harus mempertimbangkan:

1. **Kecepatan pengisian** (`avg_submission_days`):
   - Waktu rata-rata dari tabel dibuka sampai submitted/finalized
   - Dibobot dengan kompleksitas tabel (jumlah dimensi, jumlah fakta)

2. **Tingkat kelengkapan**:
   - Persentase tabel yang finalized vs total tabel
   - Persentase data yang terisi (tidak ada missing values)

3. **Kompleksitas tabel**:
   - Jumlah dimensi
   - Jumlah fakta/cells yang harus diisi
   - Jumlah tabel yang ditugaskan

4. **Kualitas data**:
   - Bonus untuk tidak ada outlier
   - Bonus untuk tidak ada data yang dikembalikan admin
   - Penalti untuk banyak revisi

### Formula Contoh
```
normalized_score = (
  (completion_rate * 40) +
  (speed_score * 30) +
  (quality_score * 20) +
  (complexity_bonus * 10)
)
```

Dimana:
- `completion_rate`: (finalized_tables / total_tables) * 100
- `speed_score`: 100 - (avg_days / max_acceptable_days * 100)
- `quality_score`: 100 - (outliers + missing + returned) / total_checks * 100
- `complexity_bonus`: normalized berdasarkan total dimensi dan fakta

### Recent Activities Actions
Jenis `action` yang bisa muncul:
- `created`: Tabel baru dibuat
- `updated`: Tabel diupdate (data diubah)
- `submitted`: Operator submit tabel untuk review
- `returned`: Admin mengembalikan tabel ke operator untuk perbaikan
- `finalized`: Admin finalisasi tabel
- `revised`: Operator merevisi data tahun sebelumnya

### Month Trend
- `submitted`: Jumlah tabel yang status >= submitted dalam bulan tersebut
- `finalized`: Jumlah tabel yang status = finalized dalam bulan tersebut
- `target`: Target yang ditetapkan untuk bulan tersebut
- `percentage`: (submitted / target) * 100

## Authorization
- **Admin**: Dapat melihat semua data (tanpa filter `organization_id`)
- **Operator**: Hanya dapat melihat data organisasinya sendiri (harus ada filter `organization_id` dari token user)

## Caching Recommendation
- Cache duration: 1 minute (data berubah cukup sering)
- Invalidate cache ketika ada perubahan status tabel (submit, finalize, return)

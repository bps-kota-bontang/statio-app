# Statio App - Sistem Pengisian Data Statistik BPS 2026

> Aplikasi web untuk mengelola pengisian, review, dan finalisasi tabel data statistik oleh instansi pemerintah.

## 🎯 Tujuan Aplikasi

Menggantikan proses pengisian data menggunakan Google Spreadsheet dengan sistem terintegrasi yang mendukung:
- ✅ Pengisian data oleh operator instansi
- ✅ Revisi data tahun sebelumnya
- ✅ Pemeriksaan outlier otomatis
- ✅ Review dan verifikasi oleh admin BPS
- ✅ Peringkat dan penghargaan untuk instansi (dinormalisasi)
- ✅ Audit trail lengkap

## 🚀 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **State Management:** SWR (for data fetching)
- **Data Grid:** Handsontable
- **Routing:** React Router 7
- **Animation:** Framer Motion
- **Icons:** Lucide React

## 📁 Struktur Project

```
statio-app/
├── src/
│   ├── app/                    # Page components
│   │   ├── Dashboard.tsx       # Dashboard utama
│   │   ├── auth/              # Login page
│   │   ├── tables/            # Table overview & detail
│   │   ├── analysis/          # Table review & analysis
│   │   └── management/        # Admin management (org, indicator, dimension)
│   ├── component/             # Reusable components
│   │   ├── ui/               # UI primitives (Button, Modal, etc)
│   │   ├── layout/           # Layout components
│   │   ├── analysis/         # Analysis-specific components
│   │   ├── management/       # Management forms
│   │   └── tables/           # Table-specific components
│   ├── service/              # API services
│   │   ├── dashboard.ts      # Dashboard API
│   │   ├── table.ts          # Table API
│   │   ├── organization.ts   # Organization API
│   │   └── ...
│   ├── type/                 # TypeScript types
│   │   ├── dashboard.ts      # Dashboard types
│   │   ├── table.ts          # Table types
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context (Auth)
│   ├── config/               # Configuration
│   └── utils/                # Utility functions
├── DASHBOARD_API.md          # Dashboard API specification
├── WORKFLOW_GUIDE.md         # Panduan workflow lengkap
├── QUICK_REFERENCE.md        # Quick reference card
└── README.md                 # This file
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ atau Bun 1.0+
- npm atau bun

### Installation

```bash
# Clone repository
git clone https://github.com/bps-kota-bontang/statio-app.git
cd statio-app

# Install dependencies
npm install
# or
bun install
```

### Environment Variables

Create `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
# or
bun run dev
```

Open http://localhost:5173

### Build for Production

```bash
npm run build
# or
bun run build
```

### Lint

```bash
npm run lint
# or
bun run lint
```

## 👥 User Roles

### Admin BPS
- ✅ Melihat dashboard keseluruhan
- ✅ Membuat dan assign tabel ke instansi
- ✅ Review tabel yang disubmit operator
- ✅ Mengembalikan tabel ke operator (return)
- ✅ Finalisasi tabel yang sudah OK
- ✅ Kelola organizations, indicators, dimensions

### Operator Instansi
- ✅ Melihat dashboard instansi sendiri
- ✅ Mengisi data tabel yang ditugaskan
- ✅ Merevisi data tahun sebelumnya
- ✅ Menambah catatan untuk admin
- ✅ Submit tabel untuk review

## 📊 Dashboard Features

### Overview Cards
- Total Tabel
- Selesai (Finalized)
- Dalam Proses
- Instansi (admin only)

### Charts & Visualizations
- **Tren Pengumpulan Tabel per Bulan:** Progress vs target
- **Status Pengisian Tabel:** Distribution (Draft/Submitted/Finalized)
- **Keterisian Data per Instansi:** Completion rate per organization
- **Instansi Tercepat:** Normalized ranking (speed + quality + complexity)
- **Aktivitas Terbaru:** Real-time activity feed

## 🔄 Workflow

```
OPERATOR                    SISTEM                     ADMIN
   │                          │                          │
   ├─ 1. Isi data            │                          │
   │   (Draft)               │                          │
   │                          │                          │
   ├─ 2. Submit ──────────►  │                          │
   │                          │                          │
   │                       3. Auto-check:                │
   │                          • Outlier                  │
   │                          • Missing data             │
   │                          • Revisions                │
   │                          │                          │
   │                          ├──────────► 4. Review     │
   │                          │                          │
   │                          │                    5. Keputusan:
   │                          │                       • Return
   │                          │                       • Finalize
   │                          │                          │
   ├─ 6a. Perbaiki ◄─────────┴──────────────────────────┤
   │    (jika returned)       │                          │
   │                          │                          │
   └─ 6b. ✅ Finalized  ◄────┴──────────────────────────┘
        (completed)
```

## 📝 API Integration

### Dashboard API

Endpoint: `GET /api/v1/dashboard/summary?year=2026&organization_id=xxx`

Response mencakup:
- Overall stats (total tables, completed, in progress)
- Monthly trend (submitted vs target)
- Status distribution (draft/submitted/finalized)
- Organization completion rates
- Performance ranking (normalized score)
- Quality flags (outliers, missing, revisions)
- Recent activities

Lihat detail di `DASHBOARD_API.md`

### Existing APIs
- `/api/v1/tables` - Table management
- `/api/v1/organizations` - Organization management
- `/api/v1/indicators` - Indicator management
- `/api/v1/dimensions` - Dimension management
- `/api/v1/auth` - Authentication

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Auto-refresh token on expiry
- Role-based access control (admin/operator)

## 📚 Documentation

- **Workflow Guide:** `WORKFLOW_GUIDE.md` - Panduan lengkap untuk operator dan admin
- **Quick Reference:** `QUICK_REFERENCE.md` - Kartu panduan cepat
- **Dashboard API:** `DASHBOARD_API.md` - API specification untuk backend
- **Component Docs:** Inline JSDoc di setiap component

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test

# E2E tests (coming soon)
npm run test:e2e
```

## 📦 Deployment

### Docker

```bash
# Build image
docker build -t statio-app .

# Run container
docker run -p 80:80 -e VITE_API_BASE_URL=https://api.example.com statio-app
```

### Manual Deployment

```bash
# Build
npm run build

# Deploy dist/ folder to web server
# Example: nginx, apache, or static hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

[MIT License](LICENSE)

## 👨‍💻 Development Team

- **BPS Kota Bontang** - Initial work
- **Contributors** - See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 📞 Support

- **Email:** support-statio@bps.go.id
- **Phone:** (0123) 456-7890
- **Documentation:** [Wiki](https://github.com/bps-kota-bontang/statio-app/wiki)

---

**Built with ❤️ for BPS Kota Bontang - Tahun 2026**

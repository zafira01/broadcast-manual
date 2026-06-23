// ============================================================
//  config.js  –  Konfigurasi utama aplikasi
// ============================================================

const CONFIG = {
  // ▼▼▼ URL DEPLOY GOOGLE APPS SCRIPT KAMU ▼▼▼
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyi0dRIkxkGr52186J5gYZKqnZLXSu6Ocb8WXsElqSW7juilP_Is7ZxUCwOMCOUQPmu/exec",
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  APP_NAME: "Broadcast Manual Dashboard Pro",
  VERSION: "2.0.0",
  ROWS_PER_PAGE: 10,

  // Nama sheet di Google Spreadsheet (harus sama persis)
  SHEETS: {
    broadcast : "broadcast",
    campaign  : "campaign",
    contacts  : "contacts",
    messages  : "messages",
    logs      : "logs",
    admin     : "admin",
    users     : "users",
  },

  // Kolom setiap sheet (urutan harus sama dengan header di Google Sheets)
  FIELDS: {
    broadcast: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "judul",     label: "Judul",        type: "text",     required: true  },
      { key: "pesan",     label: "Pesan",        type: "textarea", required: true  },
      { key: "penerima",  label: "Penerima",     type: "text",     required: true  },
      { key: "status",    label: "Status",       type: "select",
        options: ["Draft","Terkirim","Gagal","Pending"]            },
      { key: "tanggal",   label: "Tanggal",      type: "date",     required: true  },
    ],
    campaign: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "nama",      label: "Nama Campaign",type: "text",     required: true  },
      { key: "tujuan",    label: "Tujuan",       type: "textarea"                  },
      { key: "status",    label: "Status",       type: "select",
        options: ["Aktif","Selesai","Dijeda"]                       },
      { key: "mulai",     label: "Tanggal Mulai",type: "date"                      },
      { key: "selesai",   label: "Tanggal Selesai",type: "date"                   },
    ],
    contacts: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "nama",      label: "Nama",         type: "text",     required: true  },
      { key: "nomor",     label: "No. WhatsApp", type: "text",     required: true  },
      { key: "email",     label: "Email",        type: "email"                     },
      { key: "grup",      label: "Grup",         type: "text"                      },
      { key: "keterangan",label: "Keterangan",   type: "textarea"                  },
    ],
    messages: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "judul",     label: "Judul Template",type: "text",    required: true  },
      { key: "isi",       label: "Isi Pesan",    type: "textarea", required: true  },
      { key: "kategori",  label: "Kategori",     type: "text"                      },
      { key: "dibuat",    label: "Dibuat",       type: "date"                      },
    ],
    logs: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "aksi",      label: "Aksi",         type: "text",     required: true  },
      { key: "detail",    label: "Detail",       type: "textarea"                  },
      { key: "user",      label: "User",         type: "text"                      },
      { key: "waktu",     label: "Waktu",        type: "datetime-local"            },
    ],
    admin: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "nama",      label: "Nama Admin",   type: "text",     required: true  },
      { key: "email",     label: "Email",        type: "email",    required: true  },
      { key: "password",  label: "Password",     type: "password", required: true  },
      { key: "role",      label: "Role",         type: "select",
        options: ["Super Admin","Admin","Operator"]                 },
      { key: "status",    label: "Status",       type: "select",
        options: ["Aktif","Nonaktif"]                               },
    ],
    users: [
      { key: "id",        label: "ID",           type: "text",     readonly: true  },
      { key: "nama",      label: "Nama",         type: "text",     required: true  },
      { key: "email",     label: "Email",        type: "email",    required: true  },
      { key: "password",  label: "Password",     type: "password", required: true  },
      { key: "role",      label: "Role",         type: "select",
        options: ["User"]                                            },
      { key: "status",    label: "Status",       type: "select",
        options: ["Aktif","Nonaktif"]                               },
      { key: "terdaftar", label: "Terdaftar",    type: "datetime-local"            },
    ],
  },

  PAGE_TITLES: {
    dashboard : "Dashboard",
    broadcast : "Broadcast",
    campaign  : "Campaign",
    contacts  : "Contacts",
    messages  : "Messages",
    logs      : "Logs",
    admin     : "Admin",
  },
};
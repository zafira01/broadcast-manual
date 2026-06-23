// ============================================================
//  api.js  –  Semua komunikasi dengan Google Apps Script
// ============================================================

const API = {
  // Cache data lokal supaya tidak sering fetch
  _cache: {},

  // ── GET semua data dari satu sheet ──────────────────────────
  async getAll(sheet) {
    try {
      const url = `${CONFIG.SCRIPT_URL}?action=getAll&sheet=${sheet}&_=${Date.now()}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "success") {
        this._cache[sheet] = json.data;
        return json.data;
      }
      throw new Error(json.message || "Gagal mengambil data");
    } catch (err) {
      console.error("[API.getAll]", err);
      UI.showToast("Gagal terhubung ke Google Sheets", "error");
      return this._cache[sheet] || [];
    }
  },

  // ── TAMBAH baris baru ────────────────────────────────────────
  async add(sheet, rowData) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "add", sheet, data: rowData }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet]; // invalidate cache
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.add]", err);
      UI.showToast("Gagal menyimpan data", "error");
      return null;
    }
  },

  // ── UPDATE baris berdasarkan ID ──────────────────────────────
  async update(sheet, id, rowData) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "update", sheet, id, data: rowData }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet];
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.update]", err);
      UI.showToast("Gagal mengupdate data", "error");
      return null;
    }
  },

  // ── DELETE baris berdasarkan ID ──────────────────────────────
  async delete(sheet, id) {
    try {
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "delete", sheet, id }),
      });
      const json = await res.json();
      if (json.status === "success") {
        delete this._cache[sheet];
        return json;
      }
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.delete]", err);
      UI.showToast("Gagal menghapus data", "error");
      return null;
    }
  },

  // ── GET statistik untuk dashboard ───────────────────────────
  async getStats() {
    try {
      const url = `${CONFIG.SCRIPT_URL}?action=getStats&_=${Date.now()}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "success") return json.data;
      throw new Error(json.message);
    } catch (err) {
      console.error("[API.getStats]", err);
      return null;
    }
  },
};
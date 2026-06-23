// ============================================================
//  script.js  –  Controller utama aplikasi
// ============================================================

const App = {
  currentPage: "dashboard",
  currentSheet: null,
  currentRows: [],
  currentPage_num: 1,
  editId: null,

  // ── INIT ────────────────────────────────────────────────────
  async init() {
    // Cek session login
    if (sessionStorage.getItem("user_logged_in") !== "true") {
      window.location.href = "login.html";
      return;
    }

    // Tampilkan nama & role user
    const userName = sessionStorage.getItem("user_name") || "Admin";
    const userRole = sessionStorage.getItem("user_role") || "";
    const avatar = document.querySelector(".avatar");
    if (avatar) {
      avatar.textContent = userName.charAt(0).toUpperCase();
      avatar.title = `${userName} (${userRole})`;
    }
    this.injectLogout(userName, userRole);

    this.bindSidebar();
    this.bindModal();
    this.bindFAB();
    this.bindSearch();
    this.bindPagination();
    this.bindRefresh();
    this.bindMobileMenu();
    this.bindLinkBtns();
    this.bindExportBtn();

    // Sembunyikan loader dulu, baru load data
    // supaya menu tidak terblokir walau Sheets belum konek
    this.hideLoader();
    await this.loadDashboard();
	this.checkUserRole();
  },
  checkUserRole() {
  const userRole = sessionStorage.getItem("user_role") || "";
  const isAdmin = userRole.includes("Admin");

  if (!isAdmin) {
    // Sembunyikan menu admin & logs untuk user biasa
    document.querySelectorAll('.nav-item[data-page="admin"]').forEach(m => m.style.display = "none");
    document.querySelectorAll('.nav-item[data-page="logs"]').forEach(m => m.style.display = "none");
  }
},

  // ── HIDE LOADER ─────────────────────────────────────────────
  hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hidden");
  },

  // ── INJECT LOGOUT ───────────────────────────────────────────
  injectLogout(name, role) {
    const topbarRight = document.querySelector(".topbar-right");
    if (!topbarRight) return;

    const userInfo = document.createElement("div");
    userInfo.className = "user-info";
    userInfo.innerHTML = `
      <span class="user-name">${name}</span>
      <span class="user-role">${role}</span>
    `;

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "icon-btn logout-btn";
    logoutBtn.title = "Keluar";
    logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i>`;
    logoutBtn.addEventListener("click", () => {
      if (confirm(`Yakin mau keluar, ${name}?`)) {
        sessionStorage.clear();
        window.location.href = "login.html";
      }
    });

    const avatar = topbarRight.querySelector(".avatar");
    topbarRight.insertBefore(userInfo, avatar);
    topbarRight.insertBefore(logoutBtn, avatar);
  },

  // ── SIDEBAR NAVIGATION ──────────────────────────────────────
  bindSidebar() {
    document.querySelectorAll(".nav-item").forEach(li => {
      li.addEventListener("click", () => {
        const page = li.dataset.page;
        this.navigate(page);
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebarOverlay").classList.remove("show");
      });
    });
  },

  navigate(page) {
    document.querySelectorAll(".nav-item").forEach(li =>
      li.classList.toggle("active", li.dataset.page === page)
    );
    document.getElementById("pageTitle").textContent = CONFIG.PAGE_TITLES[page] || page;
    document.querySelectorAll(".page").forEach(s => s.classList.remove("active-page"));

    if (page === "dashboard") {
      document.getElementById("dashboardPage").classList.add("active-page");
      this.loadDashboard();
    } else {
      document.getElementById("dataPage").classList.add("active-page");
      document.getElementById("tableTitle").textContent = CONFIG.PAGE_TITLES[page] || page;
      this.currentSheet = CONFIG.SHEETS[page];
      this.currentPage_num = 1;
      this.loadTable(page);
    }
    this.currentPage = page;
  },

  // ── DASHBOARD ───────────────────────────────────────────────
  async loadDashboard() {
    try {
      const [broadcastRows, contactRows, campaignRows, messageRows] = await Promise.all([
        API.getAll("broadcast"),
        API.getAll("contacts"),
        API.getAll("campaign"),
        API.getAll("messages"),
      ]);

      UI.updateStatCards({
        broadcast: broadcastRows.length,
        contacts:  contactRows.length,
        campaign:  campaignRows.length,
        messages:  messageRows.length,
      });

      const monthCount = Array(12).fill(0);
      broadcastRows.forEach(r => {
        if (r.tanggal) {
          const m = new Date(r.tanggal).getMonth();
          if (!isNaN(m)) monthCount[m]++;
        }
      });
      const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      UI.renderBarChart(months, monthCount);

      const statusCount = {};
      campaignRows.forEach(r => {
        const s = r.status || "Unknown";
        statusCount[s] = (statusCount[s] || 0) + 1;
      });
      UI.renderDonutChart(Object.keys(statusCount).length > 0 ? statusCount : { "Belum ada": 1 });

      UI.renderRecentBroadcast(broadcastRows);
      document.getElementById("syncStatus").classList.add("connected");

    } catch (err) {
      console.error("Dashboard error:", err);
      // Tetap lanjut, tidak blokir UI
    }
  },

  // ── TABLE ───────────────────────────────────────────────────
  async loadTable(pageKey) {
    document.getElementById("tableBody").innerHTML =
      `<tr><td colspan="10" class="empty-row">
        <i class="fa-solid fa-spinner fa-spin"></i> Memuat...
      </td></tr>`;

    const rows = await API.getAll(pageKey);
    this.currentRows = rows;
    UI.renderTable(pageKey, rows, this.currentPage_num);
    // rebind setiap load tabel
    this.rebindTableActions(pageKey);
  },

  // ── TABLE ACTIONS (fix: tidak pakai { once:true }) ───────────
  rebindTableActions(pageKey) {
    const tbody = document.getElementById("tableBody");
    // Clone node untuk hapus semua listener lama
    const newTbody = tbody.cloneNode(true);
    tbody.parentNode.replaceChild(newTbody, tbody);

    newTbody.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".act-btn.edit");
      const delBtn  = e.target.closest(".act-btn.del");

      if (editBtn) {
        const id  = editBtn.dataset.id;
        const row = this.currentRows.find(r => String(r.id) === String(id));
        if (!row) return;
        this.editId = id;
        UI.buildForm(pageKey, row);
        UI.openModal(`Edit ${CONFIG.PAGE_TITLES[pageKey]}`);
        document.getElementById("dynamicForm").dataset.editId = id;
      }

      if (delBtn) {
        const id = delBtn.dataset.id;
        if (!confirm("Yakin ingin menghapus data ini?")) return;
        const res = await API.delete(pageKey, id);
        if (res) {
          UI.showToast("Data berhasil dihapus");
          this.loadTable(pageKey);
          this.addLog(`Hapus ${pageKey}`, `ID: ${id}`);
        }
      }
    });
  },

  // ── MODAL ───────────────────────────────────────────────────
  bindModal() {
    document.getElementById("closeModal").addEventListener("click", () => UI.closeModal());
    document.getElementById("cancelModal").addEventListener("click", () => UI.closeModal());
    document.getElementById("modalOverlay").addEventListener("click", (e) => {
      if (e.target === document.getElementById("modalOverlay")) UI.closeModal();
    });

    document.getElementById("addBtn").addEventListener("click", () => {
      this.editId = null;
      UI.buildForm(this.currentPage);
      UI.openModal(`Tambah ${CONFIG.PAGE_TITLES[this.currentPage]}`);
    });

    document.getElementById("addBtnEmpty")?.addEventListener("click", () => {
      this.editId = null;
      UI.buildForm(this.currentPage);
      UI.openModal(`Tambah ${CONFIG.PAGE_TITLES[this.currentPage]}`);
    });

    document.getElementById("dynamicForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const data   = UI.readForm(this.currentPage);
      const editId = document.getElementById("dynamicForm").dataset.editId;

      let res;
      if (editId) {
        res = await API.update(this.currentPage, editId, data);
        if (res) {
          UI.showToast("Data berhasil diupdate");
          this.addLog(`Update ${this.currentPage}`, `ID: ${editId}`);
        }
      } else {
        data.id = `${this.currentPage.toUpperCase()}-${Date.now()}`;
        res = await API.add(this.currentPage, data);
        if (res) {
          UI.showToast("Data berhasil ditambahkan");
          this.addLog(`Tambah ${this.currentPage}`, `ID: ${data.id}`);
        }
      }

      if (res) {
        UI.closeModal();
        this.loadTable(this.currentPage);
      }
    });
  },

  // ── FAB ─────────────────────────────────────────────────────
  bindFAB() {
    document.getElementById("fab").addEventListener("click", () => {
      if (this.currentPage === "dashboard") {
        this.navigate("broadcast");
      } else {
        this.editId = null;
        UI.buildForm(this.currentPage);
        UI.openModal(`Tambah ${CONFIG.PAGE_TITLES[this.currentPage]}`);
      }
    });
  },

  // ── SEARCH ──────────────────────────────────────────────────
  bindSearch() {
    let timer;
    document.getElementById("searchInput").addEventListener("input", (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = e.target.value.toLowerCase().trim();
        if (this.currentPage === "dashboard") return;
        const filtered = !q
          ? this.currentRows
          : this.currentRows.filter(row =>
              Object.values(row).some(v => String(v).toLowerCase().includes(q))
            );
        UI.renderTable(this.currentPage, filtered, 1);
        this.rebindTableActions(this.currentPage);
      }, 300);
    });
  },

  // ── PAGINATION ───────────────────────────────────────────────
  bindPagination() {
    document.getElementById("pagination").addEventListener("click", (e) => {
      const btn = e.target.closest(".pg-btn");
      if (!btn || btn.disabled) return;
      this.currentPage_num = parseInt(btn.dataset.p);
      UI.renderTable(this.currentPage, this.currentRows, this.currentPage_num);
      this.rebindTableActions(this.currentPage);
    });
  },

  // ── REFRESH ──────────────────────────────────────────────────
  bindRefresh() {
    document.getElementById("refreshBtn").addEventListener("click", async () => {
      const btn = document.getElementById("refreshBtn");
      btn.classList.add("spinning");
      API._cache = {};
      if (this.currentPage === "dashboard") {
        await this.loadDashboard();
      } else {
        await this.loadTable(this.currentPage);
      }
      setTimeout(() => btn.classList.remove("spinning"), 500);
      UI.showToast("Data berhasil diperbarui");
    });
  },

  // ── MOBILE MENU ──────────────────────────────────────────────
  bindMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    document.getElementById("menuToggle").addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  },

  // ── LINK BUTTONS ─────────────────────────────────────────────
  bindLinkBtns() {
    document.querySelectorAll(".link-btn[data-page]").forEach(btn => {
      btn.addEventListener("click", () => this.navigate(btn.dataset.page));
    });
  },

  // ── EXPORT CSV ───────────────────────────────────────────────
  bindExportBtn() {
    document.getElementById("exportBtn")?.addEventListener("click", () => {
      if (this.currentPage !== "dashboard" && this.currentRows.length > 0) {
        UI.exportCSV(this.currentPage, this.currentRows);
      } else {
        UI.showToast("Tidak ada data untuk di-export", "warn");
      }
    });
  },

  // ── AUTO LOG ─────────────────────────────────────────────────
  async addLog(aksi, detail = "") {
    const logData = {
      id    : `LOG-${Date.now()}`,
      aksi,
      detail,
      user  : sessionStorage.getItem("user_name") || "Admin",
      waktu : new Date().toLocaleString("id-ID"),
    };
    await API.add("logs", logData);
  },
};

// ── START ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => App.init());
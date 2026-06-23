// ============================================================
//  ui.js  –  Helper UI: toast, modal, tabel, pagination, chart
// ============================================================

const UI = {
  // ── TOAST ────────────────────────────────────────────────────
  _toastTimer: null,
  showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    const icon = toast.querySelector("i");
    toastMsg.textContent = msg;
    toast.className = `toast show ${type}`;
    icon.className = type === "error"
      ? "fa-solid fa-circle-xmark"
      : type === "warn"
      ? "fa-solid fa-triangle-exclamation"
      : "fa-solid fa-circle-check";
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  },

  // ── MODAL ────────────────────────────────────────────────────
  openModal(title) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOverlay").classList.add("show");
    document.body.style.overflow = "hidden";
  },
  closeModal() {
    document.getElementById("modalOverlay").classList.remove("show");
    document.body.style.overflow = "";
    document.getElementById("dynamicForm").reset();
    document.getElementById("dynamicForm").removeAttribute("data-edit-id");
  },

  // ── BUILD FORM FIELDS dari CONFIG.FIELDS ────────────────────
  buildForm(sheetKey, data = null) {
    const fields = CONFIG.FIELDS[sheetKey] || [];
    const container = document.getElementById("formFields");
    container.innerHTML = "";
    fields.forEach(f => {
      if (f.readonly) return; // skip ID field
      const wrap = document.createElement("div");
      wrap.className = "form-group";
      wrap.innerHTML = `<label for="f_${f.key}">${f.label}${f.required ? ' <span class="req">*</span>' : ""}</label>`;
      let input;
      if (f.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 3;
      } else if (f.type === "select") {
        input = document.createElement("select");
        f.options.forEach(o => {
          const opt = document.createElement("option");
          opt.value = o; opt.textContent = o;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement("input");
        input.type = f.type || "text";
      }
      input.id = `f_${f.key}`;
      input.name = f.key;
      if (f.required) input.required = true;
      if (data && data[f.key] !== undefined) input.value = data[f.key];
      wrap.appendChild(input);
      container.appendChild(wrap);
    });
  },

  // ── READ FORM → object ──────────────────────────────────────
  readForm(sheetKey) {
    const fields = CONFIG.FIELDS[sheetKey] || [];
    const obj = {};
    fields.forEach(f => {
      if (f.readonly) return;
      const el = document.getElementById(`f_${f.key}`);
      if (el) obj[f.key] = el.value.trim();
    });
    return obj;
  },

  // ── RENDER TABEL ─────────────────────────────────────────────
  renderTable(sheetKey, rows, page = 1) {
    const fields = CONFIG.FIELDS[sheetKey] || [];
    const thead = document.getElementById("tableHead");
    const tbody = document.getElementById("tableBody");
    const empty = document.getElementById("emptyState");

    // Header
    thead.innerHTML = "<tr>" +
      fields.map(f => `<th>${f.label}</th>`).join("") +
      "<th>Aksi</th></tr>";

    // Pagination slice
    const start = (page - 1) * CONFIG.ROWS_PER_PAGE;
    const slice = rows.slice(start, start + CONFIG.ROWS_PER_PAGE);

    if (slice.length === 0) {
      tbody.innerHTML = "";
      empty.style.display = "flex";
      document.getElementById("pagination").innerHTML = "";
      return;
    }
    empty.style.display = "none";

    tbody.innerHTML = slice.map(row => {
      const cells = fields.map(f => {
        let val = row[f.key] ?? "";
        if (f.key === "status") {
          const cls = { "Terkirim":"success","Aktif":"success","Selesai":"info",
                        "Draft":"warn","Pending":"warn","Gagal":"error","Nonaktif":"error" };
          return `<td><span class="badge ${cls[val]||'info'}">${val}</span></td>`;
        }
        return `<td>${val}</td>`;
      }).join("");
      return `<tr>
        ${cells}
        <td class="actions">
          <button class="act-btn edit" data-id="${row.id}" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="act-btn del" data-id="${row.id}" title="Hapus">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
    }).join("");

    this.renderPagination(rows.length, page);
  },

  // ── PAGINATION ───────────────────────────────────────────────
  renderPagination(total, current) {
    const pages = Math.ceil(total / CONFIG.ROWS_PER_PAGE);
    const el = document.getElementById("pagination");
    if (pages <= 1) { el.innerHTML = ""; return; }
    let html = `<button class="pg-btn" data-p="${current-1}" ${current===1?"disabled":""}>
      <i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="pg-btn ${i===current?"active":""}" data-p="${i}">${i}</button>`;
    }
    html += `<button class="pg-btn" data-p="${current+1}" ${current===pages?"disabled":""}>
      <i class="fa-solid fa-chevron-right"></i></button>`;
    el.innerHTML = html;
  },

  // ── STAT CARDS ───────────────────────────────────────────────
  updateStatCards(stats) {
    const map = {
      totalBroadcast: stats.broadcast ?? 0,
      totalContacts:  stats.contacts  ?? 0,
      totalCampaigns: stats.campaign  ?? 0,
      totalMessages:  stats.messages  ?? 0,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) this._countUp(el, val);
    });
  },

  _countUp(el, target) {
    let n = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n.toLocaleString("id-ID");
      if (n >= target) clearInterval(interval);
    }, 30);
  },

  // ── CHARTS ───────────────────────────────────────────────────
  _charts: {},

  renderBarChart(labels, data) {
    const ctx = document.getElementById("broadcastChart").getContext("2d");
    if (this._charts.bar) this._charts.bar.destroy();
    this._charts.bar = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Broadcast Terkirim",
          data,
          backgroundColor: "rgba(139,92,246,0.7)",
          borderColor: "#8b5cf6",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#a0aec0" } } },
        scales: {
          x: { ticks: { color: "#a0aec0" }, grid: { color: "rgba(255,255,255,0.05)" } },
          y: { ticks: { color: "#a0aec0" }, grid: { color: "rgba(255,255,255,0.08)" } },
        },
      },
    });
  },

  renderDonutChart(data) {
    const ctx = document.getElementById("campaignChart").getContext("2d");
    if (this._charts.donut) this._charts.donut.destroy();
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = ["#8b5cf6","#38bdf8","#2dd4bf","#f472b6","#fb923c"];
    this._charts.donut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }],
      },
      options: {
        responsive: true,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
    // custom legend
    const legend = document.getElementById("donutLegend");
    legend.innerHTML = labels.map((l, i) =>
      `<div class="legend-item">
        <span class="legend-dot" style="background:${colors[i]}"></span>
        <span>${l}</span>
        <strong>${values[i]}</strong>
      </div>`
    ).join("");
  },

  // ── TABEL BROADCAST TERBARU (dashboard) ─────────────────────
  renderRecentBroadcast(rows) {
    const tbody = document.getElementById("recentBroadcast");
    const recent = rows.slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-row">Belum ada broadcast</td></tr>`;
      return;
    }
    const statusCls = { "Terkirim":"success","Draft":"warn","Gagal":"error","Pending":"warn" };
    tbody.innerHTML = recent.map(r => `
      <tr>
        <td>${r.judul || "-"}</td>
        <td>${r.penerima || "-"}</td>
        <td><span class="badge ${statusCls[r.status]||'info'}">${r.status||"-"}</span></td>
        <td>${r.tanggal || "-"}</td>
      </tr>`).join("");
  },

  // ── EXPORT CSV ───────────────────────────────────────────────
  exportCSV(sheetKey, rows) {
    const fields = CONFIG.FIELDS[sheetKey] || [];
    const header = fields.map(f => f.label).join(",");
    const body = rows.map(r =>
      fields.map(f => `"${(r[f.key]||"").toString().replace(/"/g,'""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${sheetKey}_${Date.now()}.csv`;
    link.click();
  },
};
// ============================================================
//  login.js  –  Logic login (cek admin & users)
// ============================================================

const Login = {
  async init() {
    if (sessionStorage.getItem("user_logged_in") === "true") {
      window.location.href = "index.html";
      return;
    }

    this.bindForm();
    this.bindTogglePw();
  },

  bindForm() {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        this.showAlert("Username dan password wajib diisi!");
        return;
      }

      this.setLoading(true);
      this.hideAlert();

      try {
        await this.doLogin(username, password);
      } catch (err) {
        console.error("Login error:", err);
        this.showAlert("Gagal terhubung ke server. Cek koneksi internet.");
      } finally {
        this.setLoading(false);
      }
    });
  },

  async doLogin(username, password) {
    try {
      // Cek di sheet admin dulu
      const adminUrl = `${CONFIG.SCRIPT_URL}?action=getAll&sheet=admin&_=${Date.now()}`;
      const adminRes = await fetch(adminUrl);
      const adminJson = await adminRes.json();

      let found = null;
      let userRole = "";

      if (adminJson.status === "success") {
        found = adminJson.data.find(a =>
          (a.email === username || a.nama === username) &&
          a.password === password &&
          a.status === "Aktif"
        );
        if (found) userRole = found.role || "Admin";
      }

      // Kalau tidak ketemu di admin, cek di users
      if (!found) {
        const usersUrl = `${CONFIG.SCRIPT_URL}?action=getAll&sheet=users&_=${Date.now()}`;
        const usersRes = await fetch(usersUrl);
        const usersJson = await usersRes.json();

        if (usersJson.status === "success") {
          found = usersJson.data.find(u =>
            (u.email === username || u.nama === username) &&
            u.password === password &&
            u.status === "Aktif"
          );
          if (found) userRole = found.role || "User";
        }
      }

      if (!found) {
        this.showAlert("Email/username atau password salah, atau akun tidak aktif.");
        return;
      }

      // Simpan session
      sessionStorage.setItem("user_logged_in", "true");
      sessionStorage.setItem("user_name", found.nama || username);
      sessionStorage.setItem("user_email", found.email || "");
      sessionStorage.setItem("user_role", userRole);

      // Animasi sukses
      const btn = document.getElementById("loginBtn");
      btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Berhasil!`;
      btn.style.background = "linear-gradient(135deg,#34d399,#059669)";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);

    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  },

  bindTogglePw() {
    document.getElementById("togglePw").addEventListener("click", () => {
      const input = document.getElementById("password");
      const icon = document.querySelector("#togglePw i");
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-solid fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fa-solid fa-eye";
      }
    });
  },

  showAlert(msg) {
    const box = document.getElementById("alertBox");
    document.getElementById("alertMsg").textContent = msg;
    box.style.display = "flex";
    box.style.animation = "none";
    box.offsetHeight;
    box.style.animation = "";
  },

  hideAlert() {
    document.getElementById("alertBox").style.display = "none";
  },

  setLoading(state) {
    const btn = document.getElementById("loginBtn");
    const text = document.getElementById("btnText");
    const spinner = document.getElementById("btnSpinner");
    btn.disabled = state;
    text.style.display = state ? "none" : "inline";
    spinner.style.display = state ? "inline" : "none";
  },
};

window.addEventListener("DOMContentLoaded", () => Login.init());
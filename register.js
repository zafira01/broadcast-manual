const Register = {
  async init() {
    if (sessionStorage.getItem("user_logged_in") === "true") {
      window.location.href = "index.html";
      return;
    }
    this.bindForm();
    this.bindTogglePw();
  },

  bindForm() {
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const nama = document.getElementById("nama").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!nama || !email || !password) {
        this.showAlert("Semua field wajib diisi!");
        return;
      }

      if (password.length < 6) {
        this.showAlert("Password minimal 6 karakter!");
        return;
      }

      this.setLoading(true);
      this.hideAlert();

      try {
        await this.doRegister(nama, email, password);
      } catch (err) {
        this.showAlert("Gagal terhubung ke server. Cek koneksi internet.");
      } finally {
        this.setLoading(false);
      }
    });
  },

  async doRegister(nama, email, password) {
    // Cek apakah email sudah terdaftar
    const url = `${CONFIG.SCRIPT_URL}?action=getAll&sheet=users&_=${Date.now()}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.status !== "success") {
      this.showAlert("Gagal mengambil data user.");
      return;
    }

    // Cek email duplikat
    const existing = json.data.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.showAlert("Email sudah terdaftar! Silakan login.");
      return;
    }

    // Daftar user baru
    const userData = {
      id: `USER-${Date.now()}`,
      nama: nama,
      email: email,
      password: password, // Nanti bisa di-hash untuk keamanan
      role: "User",
      status: "Aktif",
      terdaftar: new Date().toISOString()
    };

    const registerRes = await fetch(CONFIG.SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "add", sheet: "users", data: userData })
    });

    const registerJson = await registerRes.json();

    if (registerJson.status === "success") {
      // Auto login setelah daftar
      sessionStorage.setItem("user_logged_in", "true");
      sessionStorage.setItem("user_name", nama);
      sessionStorage.setItem("user_email", email);
      sessionStorage.setItem("user_role", "User");

      const btn = document.getElementById("registerBtn");
      btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Berhasil!`;
      btn.style.background = "linear-gradient(135deg,#34d399,#059669)";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    } else {
      this.showAlert("Gagal mendaftar. Coba lagi.");
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
    const btn = document.getElementById("registerBtn");
    const text = document.getElementById("btnText");
    const spinner = document.getElementById("btnSpinner");
    btn.disabled = state;
    text.style.display = state ? "none" : "inline";
    spinner.style.display = state ? "inline" : "none";
  },
};

window.addEventListener("DOMContentLoaded", () => Register.init());
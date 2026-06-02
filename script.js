const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const form = document.getElementById("broadcastForm");
const table = document.getElementById("broadcastTable");

const searchInput = document.getElementById("searchInput");

let broadcasts =
JSON.parse(localStorage.getItem("broadcasts")) || [

  {
    id:1,
    name:"Promo Ramadhan",
    contact:120,
    campaign:"Campaign Lebaran",
    status:"Terkirim",
    date:"19 Mei 2026"
  },

  {
    id:2,
    name:"Info Kuliah",
    contact:90,
    campaign:"Mahasiswa",
    status:"Pending",
    date:"19 Mei 2026"
  }

];

/* MODAL */

openModal.onclick = () =>{
  modal.style.display = "flex";
};

closeModal.onclick = () =>{
  modal.style.display = "none";
};

window.onclick = (e)=>{
  if(e.target === modal){
    modal.style.display = "none";
  }
};

/* SAVE LOCAL */

function saveData(){
  localStorage.setItem(
    "broadcasts",
    JSON.stringify(broadcasts)
  );
}

/* STATS */

function updateStats(){

  document.getElementById("totalBroadcast")
  .innerText = broadcasts.length;

  const sent =
  broadcasts.filter(item =>
    item.status === "Terkirim"
  ).length;

  const pending =
  broadcasts.filter(item =>
    item.status === "Pending"
  ).length;

  document.getElementById("sentCount")
  .innerText = sent;

  document.getElementById("pendingCount")
  .innerText = pending;

  document.getElementById("campaignCount")
  .innerText = broadcasts.length;
}

/* TABLE */

function renderTable(data = broadcasts){

  table.innerHTML = "";

  data.forEach(item => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.contact}</td>
      <td>${item.campaign}</td>

      <td>
        <span class="status ${
          item.status === "Terkirim"
          ? "sent"
          : "pending"
        }">

          ${item.status}

        </span>
      </td>

      <td>${item.date}</td>

      <td>
        <button
          class="delete-btn"
          onclick="deleteBroadcast(${item.id})"
        >
          Hapus
        </button>
      </td>
    `;

    table.appendChild(row);

  });

  updateStats();
}

/* ADD */

form.addEventListener("submit",(e)=>{

  e.preventDefault();

  const newBroadcast = {

    id:Date.now(),

    name:
    document.getElementById("name").value,

    contact:
    document.getElementById("contact").value,

    campaign:
    document.getElementById("campaign").value,

    status:
    document.getElementById("status").value,

    date:new Date().toLocaleDateString(
      "id-ID",
      {
        day:"numeric",
        month:"long",
        year:"numeric"
      }
    )

  };

  broadcasts.push(newBroadcast);

  saveData();

  renderTable();

  form.reset();

  modal.style.display = "none";

});

/* DELETE */

function deleteBroadcast(id){

  broadcasts =
  broadcasts.filter(item =>
    item.id !== id
  );

  saveData();

  renderTable();
}

/* SEARCH */

searchInput.addEventListener("keyup",()=>{

  const keyword =
  searchInput.value.toLowerCase();

  const filtered =
  broadcasts.filter(item =>

    item.name
    .toLowerCase()
    .includes(keyword)

    ||

    item.campaign
    .toLowerCase()
    .includes(keyword)

  );

  renderTable(filtered);

});

renderTable();

const menuItems = document.querySelectorAll(".menu li");
const pages = document.querySelectorAll(".page");

menuItems.forEach(item => {

  item.addEventListener("click", () => {

    menuItems.forEach(menu => {
      menu.classList.remove("active");
    });

    item.classList.add("active");

    const target =
    item.getAttribute("data-page");

    pages.forEach(page => {
      page.classList.remove("active-page");
    });

    document
    .getElementById(target)
    .classList.add("active-page");

  });

});
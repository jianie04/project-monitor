document.addEventListener("DOMContentLoaded", async () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAfWLaoabC5U8vzFQyIOScZFLKPDoZh3cE",
    authDomain: "project-monitor-f6fb2.firebaseapp.com",
    projectId: "project-monitor-f6fb2",
    storageBucket: "project-monitor-f6fb2.appspot.com",
    messagingSenderId: "789686813125",
    appId: "1:789686813125:web:xxxxxx"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const deptId = urlParams.get("deptId");
  let deptName = urlParams.get("deptName");

  if (!deptName && deptId) {
    try {
      const deptSnap = await db.collection("departments").doc(deptId).get();
      if (deptSnap.exists) deptName = deptSnap.data().name;
    } catch (err) {
      console.error("Failed to fetch department name:", err);
    }
  }

  document.getElementById("deptNameHeader").textContent = decodeURIComponent(deptName || "Department");

  const addReportBtn = document.getElementById("addReportBtn");
  const dataModal = document.getElementById("dataModal");
  const closeModal = document.getElementById("closeModalBtn");
  const dataForm = document.getElementById("dataForm");
  const qaTableBody = document.getElementById("qaTableBody");
  let editId = null;

  // -------------------- Modal Control --------------------
  addReportBtn.addEventListener("click", () => {
    dataModal.style.display = "flex";
    dataForm.reset();
    editId = null;
    dataForm.querySelector(".btn-save").textContent = "Save";
  });

  closeModal.addEventListener("click", () => (dataModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === dataModal) dataModal.style.display = "none";
  });

  // -------------------- Load Reports --------------------
  async function loadReports() {
    qaTableBody.innerHTML = "";
    try {
      const snapshot = await db.collection("reports").where("deptId", "==", deptId).get();
      if (snapshot.empty) {
        qaTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No reports yet.</td></tr>`;
        return;
      }

      snapshot.forEach((doc) => {
        const r = doc.data();
        const row = `
          <tr>
            <td>${r.title || r.reportTitle || ""}</td>
            <td>${r.dbStatus || ""}</td>
            <td>${r.page || ""}</td>
            <td>${r.dateStarted || ""}</td>
            <td>${r.layoutCheck || ""}</td>
            <td>${r.layoutSize || ""}</td>
            <td>${r.spacing || ""}</td>
            <td>${r.colors || ""}</td>
            <td>${r.fonts || ""}</td>
            <td>${r.unusedFormulasRemoved || ""}</td>
            <td>${r.dateCompleted || ""}</td>
            <td>${r.developer || ""}</td>
            <td>
              <button class="edit-btn" data-id="${doc.id}">✏️</button>
              <button class="delete-btn" data-id="${doc.id}">🗑️</button>
            </td>
          </tr>`;
        qaTableBody.insertAdjacentHTML("beforeend", row);
      });
      attachRowEvents();
    } catch (err) {
      console.error(err);
      qaTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Failed to load reports</td></tr>`;
    }
  }

  // -------------------- Edit / Delete --------------------
  function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.removeEventListener("click", btn._editHandler);
      btn._editHandler = async () => {
        editId = btn.dataset.id;
        const docSnap = await db.collection("reports").doc(editId).get();
        if (!docSnap.exists) return alert("Report not found.");
        const r = docSnap.data();

        document.getElementById("reportTitle").value = r.title || r.reportTitle || "";
        document.getElementById("dbStatus").value = r.dbStatus || "";
        document.getElementById("page").value = r.page|| "";
        document.getElementById("dateStarted").value = r.dateStarted || "";
        document.getElementById("dateCompleted").value = r.dateCompleted || "";
        document.getElementById("developer").value = r.developer || "";

        ["layoutCheck","layoutSize","spacing","colors","fonts","unusedFormulasRemoved"].forEach((field) => {
          const val = r[field];
          document.querySelectorAll(`input[name='${field}']`).forEach(
            (radio) => (radio.checked = radio.value === val)
          );
        });

        dataModal.style.display = "flex";
        dataForm.querySelector(".btn-save").textContent = "Update";
      };
      btn.addEventListener("click", btn._editHandler);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.removeEventListener("click", btn._delHandler);
      btn._delHandler = async () => {
        if (!confirm("Delete this report?")) return;
        await db.collection("reports").doc(btn.dataset.id).delete();
        loadReports();
      };
      btn.addEventListener("click", btn._delHandler);
    });
  }

  // -------------------- Add / Update --------------------
  dataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const report = {
      title: document.getElementById("reportTitle").value,
      dbStatus: document.getElementById("dbStatus").value,
      page: document.getElementById("page").value,
      dateStarted: document.getElementById("dateStarted").value,
      layoutCheck: document.querySelector("input[name='layoutCheck']:checked")?.value || "No",
      layoutSize: document.querySelector("input[name='layoutSize']:checked")?.value || "No",
      spacing: document.querySelector("input[name='spacing']:checked")?.value || "No",
      colors: document.querySelector("input[name='colors']:checked")?.value || "No",
      fonts: document.querySelector("input[name='fonts']:checked")?.value || "No",
      unusedFormulasRemoved: document.querySelector("input[name='unusedFormulasRemoved']:checked")?.value || "No",
      dateCompleted: document.getElementById("dateCompleted").value,
      developer: document.getElementById("developer").value,
      updatedAt: new Date().toISOString(),
      deptId: deptId
    };

    try {
      if (editId) await db.collection("reports").doc(editId).update(report);
      else await db.collection("reports").add(report);
      dataModal.style.display = "none";
      dataForm.reset();
      editId = null;
      loadReports();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  });

  document.getElementById("backBtn").addEventListener("click", () => window.history.back());

  loadReports();
});

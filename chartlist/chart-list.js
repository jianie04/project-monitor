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

  const addChartBtn = document.getElementById("addChartBtn");
  const dataModal = document.getElementById("dataModal");
  const closeModal = document.getElementById("closeModalBtn");
  const dataForm = document.getElementById("dataForm");
  const chartTableBody = document.getElementById("chartTableBody");
  let editId = null;

  // -------------------- Modal Control --------------------
  addChartBtn.addEventListener("click", () => {
    dataModal.style.display = "flex";
    dataForm.reset();
    editId = null;
    dataForm.querySelector(".btn-save").textContent = "Save";
  });

  closeModal.addEventListener("click", () => (dataModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === dataModal) dataModal.style.display = "none";
  });

  // -------------------- Load Charts --------------------
  async function loadCharts() {
    chartTableBody.innerHTML = "";
    try {
      const snapshot = await db.collection("charts").where("deptId", "==", deptId).get();
      if (snapshot.empty) {
        chartTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No charts yet.</td></tr>`;
        return;
      }

      snapshot.forEach((doc) => {
        const c = doc.data();
        const row = `
          <tr>
            <td>${c.title || ""}</td>
            <td>${c.chartType || ""}</td>
            <td>${c.description || ""}</td>
            <td>${c.chartStatus || ""}</td>
            <td>${c.remarks || ""}</td>
            <td>
              <button class="edit-btn" data-id="${doc.id}">✏️</button>
              <button class="delete-btn" data-id="${doc.id}">🗑️</button>
            </td>
          </tr>`;
        chartTableBody.insertAdjacentHTML("beforeend", row);
      });
      attachRowEvents();
    } catch (err) {
      console.error(err);
      chartTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Failed to load charts</td></tr>`;
    }
  }

  // -------------------- Edit / Delete --------------------
  function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.removeEventListener("click", btn._editHandler);
      btn._editHandler = async () => {
        editId = btn.dataset.id;
        const docSnap = await db.collection("charts").doc(editId).get();
        if (!docSnap.exists) return alert("Chart not found.");
        const c = docSnap.data();

        document.getElementById("chartTitle").value = c.title || "";
        document.getElementById("chartType").value = c.chartType || "";
        document.getElementById("description").value = c.description || "";
        document.getElementById("chartStatus").value = c.chartStatus || "";
        document.getElementById("remarks").value = c.remarks || "";

        dataModal.style.display = "flex";
        dataForm.querySelector(".btn-save").textContent = "Update";
      };
      btn.addEventListener("click", btn._editHandler);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.removeEventListener("click", btn._delHandler);
      btn._delHandler = async () => {
        if (!confirm("Delete this chart?")) return;
        await db.collection("charts").doc(btn.dataset.id).delete();
        loadCharts();
      };
      btn.addEventListener("click", btn._delHandler);
    });
  }

  // -------------------- Add / Update --------------------
  dataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const chart = {
      title: document.getElementById("chartTitle").value,
      chartType: document.getElementById("chartType").value,
      description: document.getElementById("description").value,
      chartStatus: document.getElementById("chartStatus").value,
      remarks: document.getElementById("remarks").value,
      updatedAt: new Date().toISOString(),
      deptId: deptId
    };

    try {
      if (editId) await db.collection("charts").doc(editId).update(chart);
      else await db.collection("charts").add(chart);
      dataModal.style.display = "none";
      dataForm.reset();
      editId = null;
      loadCharts();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  });

  document.getElementById("backBtn").addEventListener("click", () => window.history.back());
  loadCharts();
});

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

  // -------------------- Fetch dept name from Firestore if missing --------------------
  if (!deptName && deptId) {
    try {
      const deptSnap = await db.collection("departments").doc(deptId).get();
      if (deptSnap.exists) deptName = deptSnap.data().name;
    } catch (err) {
      console.error("Failed to fetch department name:", err);
    }
  }

  document.getElementById("deptNameHeader").textContent = decodeURIComponent(deptName || "Department");

  // Elements
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

  closeModal.addEventListener("click", () => dataModal.style.display = "none");
  window.addEventListener("click", (e) => { if (e.target === dataModal) dataModal.style.display = "none"; });

  // -------------------- Load Reports --------------------
  async function loadReports() {
    qaTableBody.innerHTML = "";
    try {
      const snapshot = await db.collection("reports").where("deptId", "==", deptId).get();
      if (snapshot.empty) {
        qaTableBody.innerHTML = `<tr><td colspan="17" style="text-align:center;">No reports yet.</td></tr>`;
        return;
      }

      snapshot.forEach(doc => {
        const r = doc.data();
        const row = `
          <tr>
            <td>${r.title || r.reportTitle || ""}</td>
            <td>${r.dataStatus || ""}</td>
            <td>${r.dateStarted || ""}</td>
            <td>${r.missingData || ""}</td>
            <td>${r.mergeTables || ""}</td>
            <td>${r.calculatedFields || ""}</td>
            <td>${r.dataValidation || ""}</td>
            <td>${r.dataWrangled || ""}</td>
            <td>${r.duplicate || ""}</td>
            <td>${r.typoErrors || ""}</td>
            <td>${r.checkFormat || ""}</td>
            <td>${r.readyForDashboard || ""}</td>
            <td>${r.dateCompleted || ""}</td>
            <td>${r.sqlPublication || ""}</td>
            <td>${r.cloudPublication || ""}</td>
            <td>${r.personnel || ""}</td>
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
      qaTableBody.innerHTML = `<tr><td colspan="17" style="text-align:center;">Failed to load reports</td></tr>`;
    }
  }

  // -------------------- Edit / Delete --------------------
  function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.removeEventListener("click", btn._editHandler);
      btn._editHandler = async () => {
        editId = btn.dataset.id;
        const docSnap = await db.collection("reports").doc(editId).get();
        if (!docSnap.exists) return alert("Report not found.");
        const r = docSnap.data();

        document.getElementById("reportTitle").value = r.title || r.reportTitle || "";
        document.getElementById("dataStatus").value = r.dataStatus || "";
        document.getElementById("dateStarted").value = r.dateStarted || "";
        document.getElementById("missingData").value = r.missingData || "";
        document.getElementById("mergeTables").value = r.mergeTables || "";
        document.getElementById("calculatedFields").value = r.calculatedFields || "";
        document.getElementById("dateCompleted").value = r.dateCompleted || "";
        document.getElementById("sqlPublication").value = r.sqlPublication || "";
        document.getElementById("cloudPublication").value = r.cloudPublication || "";
        document.getElementById("personnel").value = r.personnel || "";

        ["dataValidation","dataWrangled","duplicate","typoErrors","checkFormat","readyForDashboard"]
          .forEach(field => {
            const val = r[field];
            document.querySelectorAll(`input[name='${field}']`).forEach(radio => radio.checked = radio.value === val);
          });

        dataModal.style.display = "flex";
        dataForm.querySelector(".btn-save").textContent = "Update";
      };
      btn.addEventListener("click", btn._editHandler);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.removeEventListener("click", btn._delHandler);
      btn._delHandler = async () => {
        if(!confirm("Delete this report?")) return;
        await db.collection("reports").doc(btn.dataset.id).delete();
        loadReports();
      };
      btn.addEventListener("click", btn._delHandler);
    });
  }

  // -------------------- Add / Update --------------------
  dataForm.addEventListener("submit", async e => {
    e.preventDefault();
    const report = {
      title: document.getElementById("reportTitle").value,
      dataStatus: document.getElementById("dataStatus").value,
      dateStarted: document.getElementById("dateStarted").value,
      missingData: document.getElementById("missingData").value,
      mergeTables: document.getElementById("mergeTables").value,
      calculatedFields: document.getElementById("calculatedFields").value,
      dataValidation: document.querySelector("input[name='dataValidation']:checked")?.value || "No",
      dataWrangled: document.querySelector("input[name='dataWrangled']:checked")?.value || "No",
      duplicate: document.querySelector("input[name='duplicate']:checked")?.value || "No",
      typoErrors: document.querySelector("input[name='typoErrors']:checked")?.value || "No",
      checkFormat: document.querySelector("input[name='checkFormat']:checked")?.value || "No",
      readyForDashboard: document.querySelector("input[name='readyForDashboard']:checked")?.value || "No",
      dateCompleted: document.getElementById("dateCompleted").value,
      sqlPublication: document.getElementById("sqlPublication").value,
      cloudPublication: document.getElementById("cloudPublication").value,
      personnel: document.getElementById("personnel").value,
      updatedAt: new Date().toISOString(),
      deptId: deptId
    };

    try {
      if(editId) await db.collection("reports").doc(editId).update(report);
      else await db.collection("reports").add(report);
      dataModal.style.display = "none";
      dataForm.reset();
      editId = null;
      loadReports();
    } catch(err) {
      console.error(err);
      alert("Save failed");
    }
  });

  // -------------------- Back Button --------------------
  document.getElementById("backBtn").addEventListener("click", () => window.history.back());

  // Initial load
  loadReports();
});

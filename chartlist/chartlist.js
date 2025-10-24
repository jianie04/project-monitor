document.addEventListener("DOMContentLoaded", () => {
  // -------------------- Firebase Configuration --------------------
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

// Read deptId and reportId from URL
const urlParams = new URLSearchParams(window.location.search);
const deptId = urlParams.get("deptId");
const reportId = urlParams.get("reportId");
const deptName = urlParams.get("deptName");
const reportName = urlParams.get("reportName");

// Set headers
document.getElementById("deptNameHeader").textContent = decodeURIComponent(deptName || "Department");
document.getElementById("reportNameHeader").textContent = decodeURIComponent(reportName || "Report");



document.getElementById("backBtn").addEventListener("click", () => {
  if (deptId && reportId) {
    // Sends back to view-reports.html with same deptId and highlightReport
    window.location.href = `/view-reports/view-reports.html?deptId=${encodeURIComponent(deptId)}&highlightReport=${encodeURIComponent(reportId)}`;
  } else {
    window.history.back();
  }
});


  // -------------------- DOM Elements --------------------
  const addReportBtn = document.getElementById("addReportBtn");
  const dataModal = document.getElementById("dataModal");
  const closeModal = document.getElementById("closeModalBtn");
  const dataForm = document.getElementById("dataForm");
  const dataBody = document.getElementById("dataBody");

  let editId = null; // to track editing

  // -------------------- Modal Control --------------------
  addReportBtn.addEventListener("click", () => {
    dataModal.style.display = "flex";
    dataForm.reset();
    editId = null;
    dataForm.querySelector(".btn-save").textContent = "Save";
  });

  closeModal.addEventListener("click", () => {
    dataModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === dataModal) {
      dataModal.style.display = "none";
    }
  });

  // -------------------- Load Reports --------------------
  async function loadReports() {
    dataBody.innerHTML = "";
    const snapshot = await db.collection("data_reports").get();

    if (snapshot.empty) {
      dataBody.innerHTML = `<tr><td colspan="17" class="no-data">No reports found</td></tr>`;
      return;
    }

    snapshot.forEach((doc) => {
      const r = doc.data();
      const row = `
        <tr>
          <td>${r.dataName}</td>
          <td>${r.status}</td>
          <td>${r.dateStarted}</td>
          <td>${r.missingData}</td>
          <td>${r.mergeTables}</td>
          <td>${r.calculatedFields}</td>
          <td>${r.dataValidation}</td>
          <td>${r.dataWrangled}</td>
          <td>${r.duplicate}</td>
          <td>${r.typoErrors}</td>
          <td>${r.checkFormat}</td>
          <td>${r.readyForDashboard}</td>
          <td>${r.dateCompleted}</td>
          <td>${r.sqlPublication}</td>
          <td>${r.cloudPublication}</td>
          <td>${r.developer}</td>
          <td>
            <button class="edit-btn" data-id="${doc.id}">✏️</button>
            <button class="delete-btn" data-id="${doc.id}">🗑️</button>
          </td>
        </tr>`;
      dataBody.insertAdjacentHTML("beforeend", row);
    });

    attachRowEvents();
  }

  // -------------------- Add / Update Report --------------------
  dataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const report = {
      dataName: document.getElementById("dataName").value,
      status: document.getElementById("status").value,
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
      developer: document.getElementById("developer").value,
      createdAt: new Date().toISOString(),
    };

    if (editId) {
      await db.collection("data_reports").doc(editId).update(report);
    } else {
      await db.collection("data_reports").add(report);
    }

    dataForm.reset();
    dataModal.style.display = "none";
    editId = null;
    dataForm.querySelector(".btn-save").textContent = "Save";
    loadReports();
  });

  // -------------------- Edit / Delete Buttons --------------------
  function attachRowEvents() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Delete this report?")) {
          await db.collection("data_reports").doc(id).delete();
          loadReports();
        }
      });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        editId = btn.dataset.id;
        const doc = await db.collection("data_reports").doc(editId).get();
        if (!doc.exists) return;

        const r = doc.data();
        document.getElementById("dataName").value = r.dataName;
        document.getElementById("status").value = r.status;
        document.getElementById("dateStarted").value = r.dateStarted;
        document.getElementById("missingData").value = r.missingData;
        document.getElementById("mergeTables").value = r.mergeTables;
        document.getElementById("calculatedFields").value = r.calculatedFields;
        document.getElementById("dateCompleted").value = r.dateCompleted;
        document.getElementById("sqlPublication").value = r.sqlPublication;
        document.getElementById("cloudPublication").value = r.cloudPublication;
        document.getElementById("developer").value = r.developer;

        // Radio buttons
        ["dataValidation","dataWrangled","duplicate","typoErrors","checkFormat","readyForDashboard"].forEach(field => {
          const val = r[field];
          if(val){
            const radio = document.querySelector(`input[name='${field}'][value='${val}']`);
            if(radio) radio.checked = true;
          }
        });

        dataModal.style.display = "flex";
        dataForm.querySelector(".btn-save").textContent = "Update";
      });
    });
  }

  // -------------------- Initialize --------------------
  loadReports();
});

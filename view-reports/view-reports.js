// =======================================================
  // ✅ FIREBASE INITIALIZATION
  // =======================================================
  const firebaseConfig = {
    apiKey: "AIzaSyAfWLaoabC5U8vzFQyIOScZFLKPDoZh3cE",
    authDomain: "project-monitor-f6fb2.firebaseapp.com",
    projectId: "project-monitor-f6fb2",
    storageBucket: "project-monitor-f6fb2.appspot.com",
    messagingSenderId: "789686813125",
    appId: "1:789686813125:web:d931d3b0ae13e674248bac",
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // =======================================================
  // ✅ DOM ELEMENTS
  // =======================================================
  const urlParams = new URLSearchParams(window.location.search);
  const deptId = urlParams.get("deptId");
  const deptHeader = document.getElementById("deptNameHeader");
  const reportsTable = document.getElementById("reportsTable");

  const btnAddReport = document.getElementById("btnAddReport");
  const reportModal = document.getElementById("reportModal");
  const reportModalTitle = document.getElementById("reportModalTitle");
  const reportForm = document.getElementById("reportForm");
  const closeReportModal = document.getElementById("closeReportModal");

  const dataQAModal = document.getElementById("dataQAModal");
  const chartModal = document.getElementById("chartModal");

  let editReportId = null;

  // =======================================================
  // ✅ LOAD REPORTS
  // =======================================================
  async function loadReports() {
    reportsTable.innerHTML = `<tr><td colspan="12" class="no-data">Loading reports...</td></tr>`;

    if (!deptId) {
      reportsTable.innerHTML = `<tr><td colspan="12" class="no-data">Invalid department ID</td></tr>`;
      return;
    }

    const deptSnap = await db.collection("departments").doc(deptId).get();
    const deptName = deptSnap.exists ? deptSnap.data().name : "Unknown Department";
    deptHeader.textContent = deptName;

    const snapshot = await db.collection("reports").where("deptId", "==", deptId).get();
    if (snapshot.empty) {
      reportsTable.innerHTML = `<tr><td colspan="12" class="no-data">No reports found for ${deptName}</td></tr>`;
      return;
    }

    reportsTable.innerHTML = "";
    snapshot.forEach(doc => {
  const r = doc.data();
  const coverage = r.dateFrom && r.dateTo ? `${r.dateFrom} → ${r.dateTo}` : "-";

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${r.title || "-"}</td>
    <td>${r.dateRequested || "-"}</td>
    <td>${r.dateReceived || "-"}</td>
    <td>${coverage}</td>
    <td>${r.source || "-"}</td>
    <td>${r.status || "-"}</td>
    <td>${r.sourceFiles || "-"}</td>
    <td>${r.sentThrough || "-"}</td>
    <td>${r.sentBy || "-"}</td>
    <td>${r.frequency || "-"}</td>
    <td class="remarks-cell">
      <span class="action-icons">
        <button title="Edit" data-id="${doc.id}"><i class="fa-solid fa-edit"></i></button>
        <button title="Delete" data-id="${doc.id}"><i class="fa-solid fa-trash"></i></button>
        <button title="Data QA" data-id="${doc.id}"><i class="fa-solid fa-database"></i></button>
        <button title="Add Chart" data-id="${doc.id}"><i class="fa-solid fa-chart-bar"></i></button>
      </span>
    </td>`;
  reportsTable.appendChild(row);
});


    attachActionEvents();
  }

  // =======================================================
  // ✅ ATTACH ACTION BUTTONS
  // =======================================================
  function attachActionEvents() {
    // Edit
    document.querySelectorAll(".action-icons button[title='Edit']").forEach(btn => {
      btn.addEventListener("click", async e => {
        editReportId = e.target.closest("button").dataset.id;
        const docSnap = await db.collection("reports").doc(editReportId).get();
        if (!docSnap.exists) return alert("Report not found!");
        const r = docSnap.data();

        reportModalTitle.textContent = "Edit Report";
        Object.keys(inputs).forEach(key => {
          inputs[key].value = r[key] || "";
        });
        reportModal.classList.add("show");
      });
    });

    // Delete
    document.querySelectorAll(".action-icons button[title='Delete']").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.closest("button").dataset.id;
        if (confirm("Are you sure you want to delete this report?")) {
          await db.collection("reports").doc(id).delete();
          alert("🗑️ Report deleted successfully!");
          loadReports();
        }
      });
    });

   // Data QA → open separate page, include department name
document.querySelectorAll(".action-icons button[title='Data QA']").forEach(btn => {
  btn.addEventListener("click", e => {
    const button = e.target.closest("button");
    const id = button.dataset.id;
    
    // 🔹 Get department name from your table or data
    // If you already have the department in your table row:
    const row = button.closest("tr");
    const department = row.querySelector(".department-cell")?.innerText || "All";

    // Redirect with both reportId + department in URL
    window.location.href = `/data-qa/data-qa.html?reportId=${id}&dept=${encodeURIComponent(department)}`;
  });
});

    // Add Chart
    document.querySelectorAll(".action-icons button[title='Add Chart']").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.closest("button").dataset.id;
        chartModal.dataset.reportId = id;
        chartModal.classList.add("show");
      });
    });
  }

  // =======================================================
  // ✅ ADD REPORT BUTTON
  // =======================================================
  const inputs = {
    reportTitle: document.getElementById("reportTitle"),
    dateRequested: document.getElementById("dateRequested"),
    dateReceived: document.getElementById("dateReceived"),
    dateFrom: document.getElementById("dateFrom"),
    dateTo: document.getElementById("dateTo"),
    reportSource: document.getElementById("reportSource"),
    reportStatus: document.getElementById("reportStatus"),
    sourceFiles: document.getElementById("sourceFiles"),
    sentThrough: document.getElementById("sentThrough"),
    sentBy: document.getElementById("sentBy"),
    reportFrequency: document.getElementById("reportFrequency"),
    // remarks: document.getElementById("remarks"),
  };

  btnAddReport.addEventListener("click", () => {
    editReportId = null;
    reportModalTitle.textContent = "Add New Report";
    reportForm.reset();
    reportModal.classList.add("show");
  });

  // =======================================================
  // ✅ SAVE REPORT (ADD OR EDIT)
  // =======================================================
  reportForm.addEventListener("submit", async e => {
    e.preventDefault();

    const data = {
      title: inputs.reportTitle.value,
      dateRequested: inputs.dateRequested.value,
      dateReceived: inputs.dateReceived.value,
      dateFrom: inputs.dateFrom.value,
      dateTo: inputs.dateTo.value,
      source: inputs.reportSource.value,
      status: inputs.reportStatus.value,
      sourceFiles: inputs.sourceFiles.value,
      sentThrough: inputs.sentThrough.value,
      sentBy: inputs.sentBy.value,
      frequency: inputs.reportFrequency.value,
      // remarks: inputs.remarks.value,
      deptId: deptId,
      updatedAt: new Date().toISOString(),
    };

    if (!data.title || !data.status || !data.frequency)
      return alert("⚠️ Please fill in Title, Status, and Frequency.");

    try {
      if (editReportId) {
        await db.collection("reports").doc(editReportId).update(data);
        alert("✅ Report updated successfully!");
      } else {
        data.createdAt = new Date().toISOString();
        await db.collection("reports").add(data);
        alert("✅ Report added successfully!");
      }
      reportModal.classList.remove("show");
      loadReports();
    } catch (err) {
      console.error(err);
      alert("❌ Error saving report.");
    }
  });

  // =======================================================
  // ✅ MODAL CLOSE EVENTS
  // =======================================================
  closeReportModal.addEventListener("click", () => reportModal.classList.remove("show"));
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target.classList.contains("modal")) modal.classList.remove("show");
    });
  });

  // =======================================================
  // ✅ INITIAL LOAD
  // =======================================================
  loadReports();
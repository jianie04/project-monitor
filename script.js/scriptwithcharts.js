// =======================================================
// ✅ FIREBASE INITIALIZATION
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyAfWLaoabC5U8vzFQyIOScZFLKPDoZh3cE",
  authDomain: "project-monitor-f6fb2.firebaseapp.com",
  projectId: "project-monitor-f6fb2",
  storageBucket: "project-monitor-f6fb2.firebasestorage.app",
  messagingSenderId: "789686813125",
  appId: "1:789686813125:web:d931d3b0ae13e674248bac"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase connected");


// =======================================================
// ✅ DASHBOARD LOADERS
// =======================================================
async function loadDashboard() {
  const collections = ["departments", "reports", "charts", "licenses"];
  const snapshots = await Promise.all(collections.map(col => db.collection(col).get()));

  document.getElementById("totalDepartments").innerText = snapshots[0].size;
  document.getElementById("totalReports").innerText = snapshots[1].size;
  document.getElementById("totalCharts").innerText = snapshots[2].size;
  document.getElementById("totalLicenses").innerText = snapshots[3].size;
}

// =======================================================
// ✅ SUMMARY TABLE (DEPARTMENTS)
// =======================================================
async function loadSummary() {
  const tbody = document.getElementById("summaryTable");
  tbody.innerHTML = "";
  const snapshot = await db.collection("departments").get();

  snapshot.forEach((doc) => {
    const d = doc.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name || "-"}</td>
      <td>${d.source || "-"}</td>
      <td>${d.status || "-"}</td>
      <td>${d.dbstatus || "-"}</td>
      <td>${d.license || "-"}</td>
      <td>${d.updated || "-"}</td>
     
      <td class="action-icons">
        <i class="fas fa-plus-circle add-report-icon" title="Add Report" data-id="${doc.id}"></i>
        <i class="fas fa-file-alt view-reports-icon" title="View Reports" data-id="${doc.id}"></i>
        <i class="fas fa-edit edit-icon" title="Edit" data-id="${doc.id}"></i>
        <i class="fas fa-trash delete-icon" title="Delete" data-id="${doc.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  // --- Action Button Styles ---
  // document.querySelectorAll(".action-icons i").forEach(icon => {
  //   icon.style.margin = "0 6px";
  //   icon.style.cursor = "pointer";
  //   icon.style.transition = "color 0.2s ease";
  //   icon.addEventListener("mouseover", () => icon.style.color = "#007bff");
  //   icon.addEventListener("mouseout", () => icon.style.color = "");
  // });

  // 🔧 --- Delete function ---
  document.querySelectorAll(".delete-icon").forEach(icon => {
    icon.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this department?")) {
        try {
          await db.collection("departments").doc(id).delete();
          alert("🗑️ Department deleted successfully!");
          loadDashboard();
          loadSummary();
          loadMonthlyCharts();
        } catch (err) {
          console.error("Error deleting document:", err);
          alert("❌ Failed to delete department.");
        }
      }
    });
  });

  // ✏️ --- Edit function ---
  document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const docSnap = await db.collection("departments").doc(id).get();
      if (!docSnap.exists) return alert("Department not found.");

      const d = docSnap.data();
      document.getElementById("deptName").value = d.name || "";
      document.getElementById("deptSource").value = d.source || "";
      document.getElementById("deptStatus").value = d.status || "";
      document.getElementById("dbStatus").value = d.dbstatus || "";
      document.getElementById("deptLicense").value = d.license || "";
      document.getElementById("deptUpdated").value = d.updated || "";
      // document.getElementById("deptFrequency").value = d.frequency || "";

      modal.style.display = "flex";
      const saveBtn = form.querySelector("button[type='submit']");
      saveBtn.textContent = "Update";

      const updateHandler = async (e) => {
        e.preventDefault();
        const updatedData = {
          name: document.getElementById("deptName").value,
          source: document.getElementById("deptSource").value,
          status: document.getElementById("deptStatus").value,
          dbstatus: document.getElementById("dbStatus").value,
          license: document.getElementById("deptLicense").value,
          updated: document.getElementById("deptUpdated").value,
          // frequency: document.getElementById("deptFrequency").value,
        };

        try {
          await db.collection("departments").doc(id).update(updatedData);
          alert("✅ Department updated successfully!");
          form.reset();
          modal.style.display = "none";
          saveBtn.textContent = "Save";
          form.removeEventListener("submit", updateHandler);
          loadDashboard();
          loadSummary();
          loadMonthlyCharts();
        } catch (err) {
          console.error("Error updating document:", err);
          alert("❌ Failed to update department.");
        }
      };

      form.addEventListener("submit", updateHandler);
    });
  });

  // 📝 Add Report
  document.querySelectorAll(".add-report-icon").forEach(icon => {
    icon.addEventListener("click", async (e) => {
      const deptId = e.target.getAttribute("data-id");
      const docSnap = await db.collection("departments").doc(deptId).get();
      if (!docSnap.exists) {
        alert("Department not found.");
        return;
      }

      const d = docSnap.data();
      selectedDept = { id: deptId, name: d.name || "Unknown Department" };
      document.getElementById("reportSource").value = selectedDept.name;
      reportModal.style.display = "flex";
    });
  });

  // 📑 View Reports
  document.querySelectorAll(".view-reports-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const deptId = e.target.getAttribute("data-id");
      const deptName = e.target.closest("tr").children[0].innerText;
      window.location.href = `/view-reports/view-reports.html?deptId=${deptId}&deptName=${encodeURIComponent(deptName)}`;
    });
  });

}


// =======================================================
// ✅ CHART FUNCTIONS
// =======================================================
function createLineChart(canvasId, label, data, color = "#5578a7ff") {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}33`,
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: color,
        pointRadius: 4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

async function loadMonthlyChart(collectionName, canvasId, label, color) {
  const snapshot = await db.collection(collectionName).get();
  const monthlyCount = Array(12).fill(0);

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.updated) {
      const month = new Date(data.updated).getMonth();
      monthlyCount[month]++;
    }
  });

  createLineChart(canvasId, label, monthlyCount, color);
}


// =======================================================
// ✅ ADD DEPARTMENT MODAL + FIRESTORE LOGIC
// =======================================================
const modal = document.getElementById("addDeptModal");
const openBtn = document.getElementById("addDeptBtn");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("addDeptForm");
const deptSelect = document.getElementById("deptName");

// --- Modal behavior ---
openBtn.onclick = async () => {
  modal.style.display = "flex";
  await refreshDeptOptions(); // refresh disabled options when opened
};
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

// --- Disable already used departments ---
async function refreshDeptOptions() {
  const snapshot = await db.collection("departments").get();
  const usedDepts = snapshot.docs.map(doc => doc.data().name);

  for (let option of deptSelect.options) {
    if (usedDepts.includes(option.value)) {
      option.disabled = true;
    } else {
      option.disabled = false;
    }
  }
}

// --- Save Department ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deptData = {
    name: deptSelect.value,
    source: document.getElementById("deptSource").value,
    status: document.getElementById("deptStatus").value,
    dbstatus: document.getElementById("dbStatus").value,
    license: document.getElementById("deptLicense").value,
    updated: document.getElementById("deptUpdated").value,
    // frequency: document.getElementById("deptFrequency").value,
  };

  try {
    // Prevent duplicate Firestore entries
    const existing = await db.collection("departments").where("name", "==", deptData.name).get();
    if (!existing.empty) {
      alert("⚠️ This department has already been added.");
      return;
    }

    // Add department record
    const docRef = await db.collection("departments").add(deptData);

    // Add to licenses if applicable
    if (deptData.license === "Licensed") {
      await db.collection("licenses").add({
        departmentId: docRef.id,
        name: deptData.name,
        status: deptData.status,
        dbstatus: deptData.dbstatus,
        source: deptData.source,
        updated: deptData.updated,
        // frequency: deptData.frequency,
        addedAt: new Date().toISOString(),
      });
        // 🟢 Update dashboard & chart immediately
          await loadDashboard();
          await loadMonthlyCharts();
    }

    alert("✅ Department added successfully!");
    form.reset();
    deptSelect.selectedIndex = 0;
    modal.style.display = "none";
    loadDashboard();
    loadSummary();
    loadMonthlyCharts();
    refreshDeptOptions(); // disable newly added dept
  } catch (err) {
    console.error("Error adding department:", err);
    alert("❌ Failed to add department.");
  }
});


// =======================================================
// ✅ ADD REPORT MODAL + FIRESTORE LOGIC
// =======================================================
const reportModal = document.getElementById("addReportModal");
const closeReportBtn = document.getElementById("closeReportModal");
const reportForm = document.getElementById("addReportForm");

let currentDept = null; // tracks which department the report belongs to

// --- Modal behavior ---
closeReportBtn.onclick = () => (reportModal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === reportModal) reportModal.style.display = "none";
});

// 🟢 Open modal from department table (add-report-icon)
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("add-report-icon")) {
    const deptId = e.target.getAttribute("data-id");
    const docSnap = await db.collection("departments").doc(deptId).get();
    if (!docSnap.exists) return alert("Department not found.");

    const d = docSnap.data();
    currentDept = { id: deptId, name: d.name || "Unknown Department" };

    // Prefill "Data Source" dropdown
    // const reportSource = document.getElementById("reportSource");
    // reportSource.innerHTML = `<option value="${currentDept.name}" selected>${currentDept.name}</option>`;

    reportModal.style.display = "flex";
  }
});

// 🟢 Save report (linked to department)
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentDept) {
    alert("⚠️ Please open 'Add Report' from a department row.");
    return;
  }

  const reportData = {
    title: document.getElementById("reportTitle").value,
    dateRequested: document.getElementById("dateRequested").value,
    dateReceived: document.getElementById("dateReceived").value,
    dateFrom: document.getElementById("dateFrom").value,
    dateTo: document.getElementById("dateTo").value,
    source: document.getElementById("reportSource").value,
    status: document.getElementById("reportStatus").value,
    sourceFiles: document.getElementById("sourceFiles").value,
    sentThrough: document.getElementById("sentThrough").value,
    sentBy: document.getElementById("sentBy").value,
    frequency: document.getElementById("reportFrequency").value,
    remarks: document.getElementById("remarks").value,
    createdAt: new Date().toISOString(),
    deptId: currentDept.id, // link to department
  };

  try {
    await db.collection("reports").add(reportData);
    alert(`✅ Report added successfully for ${currentDept.name}!`);
    reportForm.reset();
    reportModal.style.display = "none";
    currentDept = null;

    // Optional: refresh dashboard or summary if needed
    loadDashboard();
    loadSummary();
    loadMonthlyCharts();
  } catch (err) {
    console.error("Error adding report:", err);
    alert("❌ Failed to add report.");
  }
});




// =======================================================
// ✅ LOAD ALL CHARTS & INITIALIZE DASHBOARD
// =======================================================
async function loadMonthlyCharts() {
  await loadMonthlyChart("departments", "departmentChart", "Departments Added per Month", "#004aad");
  await loadMonthlyChart("reports", "reportsChart", "Reports Added per Month", "#ff9800");
  await loadMonthlyChart("charts", "chartsChart", "Charts Added per Month", "#4caf50");
  await loadMonthlyChart("licenses", "licensesChart", "Licenses Added per Month", "#9c27b0");
}

loadDashboard();
loadSummary();
loadMonthlyCharts();
refreshDeptOptions();


document.getElementById("btnAddReport").addEventListener("click", () => {
  window.location.href = `add-report.html?deptId=${deptId}`;
});

document.getElementById("btnDeleteDept").addEventListener("click", async () => {
  if (!deptId) return alert("Department ID not found!");
  if (confirm("Are you sure you want to delete this department and all its reports?")) {
    try {
      // delete reports under this department first
      const reportsSnap = await db.collection("reports").where("sourceId", "==", deptId).get();
      const batch = db.batch();
      reportsSnap.forEach(doc => batch.delete(doc.ref));

      // delete department
      batch.delete(db.collection("departments").doc(deptId));
      await batch.commit();

      alert("🗑️ Department and related reports deleted!");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("❌ Failed to delete department.");
    }
  }
});


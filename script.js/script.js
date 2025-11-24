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

// // Check auth state
// firebase.auth().onAuthStateChanged(user => {
//   if (user) {
//     console.log("User logged in:", user.email);
//   } else {
//     console.log("No user logged in, redirecting...");
//     window.location.href = "/login/login.html"; // or relative path
//   }
// });

// =======================================================
// ✅ AUTHENTICATION PROTECTION
// =======================================================
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // User is not logged in, redirect to login page
    window.location.href = "/login/login.html";
  }
});

// Logout button
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = "/login/login.html";
    })
    .catch(err => console.error("Logout failed:", err));
});

// =======================================================
// ✅ DASHBOARD LOADERS (UPDATED)
// =======================================================
async function loadDashboard() {
  try {
    const deptSnap = await db.collection("departments").get();
    const reportSnap = await db.collection("reports").get();
    const chartsSnap = await db.collection("charts").get();
    const licenseSnap = await db.collection("licenses").get();

    // 🧮 Count how many departments have Published dashboard
    const publishedCount = deptSnap.docs.filter(doc => doc.data().dbstatus === "Published").length;

    // 🧮 Count how many departments have Licensed status
    const licensedCount = deptSnap.docs.filter(doc => doc.data().license === "Licensed").length;

    document.getElementById("totalDepartments").innerText = publishedCount;
    document.getElementById("totalReports").innerText = reportSnap.size;
    document.getElementById("totalCharts").innerText = chartsSnap.size;
    document.getElementById("totalLicenses").innerText = licensedCount;
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
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
        <i class="fas fa-file-alt view-reports-icon" title="View Reports" data-id="${doc.id}"></i>
        <i class="fas fa-edit edit-icon" title="Edit" data-id="${doc.id}"></i>
        <i class="fas fa-trash delete-icon" title="Delete" data-id="${doc.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  // 🗑️ Delete Department
  document.querySelectorAll(".delete-icon").forEach(icon => {
    icon.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this department?")) {
        try {
          const deptRef = db.collection("departments").doc(id);
          const deptSnap = await deptRef.get();
          const deptData = deptSnap.data();

          await deptRef.delete();

          // Remove license if it exists
          if (deptData && deptData.license === "Licensed") {
            const licenseSnap = await db.collection("licenses").where("name", "==", deptData.name).get();
            const batch = db.batch();
            licenseSnap.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }

          alert("🗑️ Department deleted successfully!");
          loadDashboard();
          loadSummary();
        } catch (err) {
          console.error("Error deleting document:", err);
          alert("❌ Failed to delete department.");
        }
      }
    });
  });

  // ✏️ Edit Department
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
        } catch (err) {
          console.error("Error updating document:", err);
          alert("❌ Failed to update department.");
        }
      };

      form.addEventListener("submit", updateHandler);
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
// ✅ ADD DEPARTMENT LOGIC
// =======================================================
const modal = document.getElementById("addDeptModal");
const openBtn = document.getElementById("addDeptBtn");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("addDeptForm");
const deptSelect = document.getElementById("deptName");

openBtn.onclick = async () => {
  modal.style.display = "flex";
  await refreshDeptOptions();
};
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

async function refreshDeptOptions() {
  const snapshot = await db.collection("departments").get();
  const usedDepts = snapshot.docs.map(doc => doc.data().name);

  for (let option of deptSelect.options) {
    option.disabled = usedDepts.includes(option.value);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const deptData = {
    name: deptSelect.value,
    source: document.getElementById("deptSource").value,
    status: document.getElementById("deptStatus").value,
    dbstatus: document.getElementById("dbStatus").value,
    license: document.getElementById("deptLicense").value,
    updated: document.getElementById("deptUpdated").value,
  };

  try {
    const existing = await db.collection("departments").where("name", "==", deptData.name).get();
    if (!existing.empty) {
      alert("⚠️ This department has already been added.");
      return;
    }

    const docRef = await db.collection("departments").add(deptData);

    if (deptData.license === "Licensed") {
      await db.collection("licenses").add({
        departmentId: docRef.id,
        name: deptData.name,
        status: deptData.status,
        dbstatus: deptData.dbstatus,
        source: deptData.source,
        updated: deptData.updated,
        addedAt: new Date().toISOString(),
      });
    }

    alert("✅ Department added successfully!");
    form.reset();
    deptSelect.selectedIndex = 0;
    modal.style.display = "none";
    loadDashboard();
    loadSummary();
    refreshDeptOptions();
  } catch (err) {
    console.error("Error adding department:", err);
    alert("❌ Failed to add department.");
  }
});


// =======================================================
// ✅ INITIAL LOAD
// =======================================================
loadDashboard();
loadSummary();
refreshDeptOptions();

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

    // Get reportId from URL
    const reportNameHeader = document.getElementById("reportNameHeader");

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get("reportId");
    const deptId = urlParams.get("deptId");
    const deptName = urlParams.get("deptName");
    const reportDetails = urlParams.get("reportDetails");

 // 🧭 Change header text
const header = document.querySelector("header");
if (deptName && reportDetails) {
  header.textContent = `${deptName} ${reportDetails}`;
} else {
  header.textContent = "Data QA Review";
}

// 🔙 Back button behavior
const backButton = document.querySelector(".btn-back");
if (deptId && deptName) {
  backButton.href = `/view-reports/view-reports.html?deptId=${encodeURIComponent(deptId)}&deptName=${encodeURIComponent(deptName)}`;

}


    // Add Edit/Delete buttons
    const actionCell = document.createElement("td");
    actionCell.innerHTML = `
      <button class="action-btn edit-btn" data-id="${i}">Edit</button>
      <button class="action-btn delete-btn" data-id="${i}">Delete</button>
    `;
    row.appendChild(actionCell);

    qaTableBody.appendChild(row);
  

  attachRowActions();


// ✏️ Edit/Delete Handlers
function attachRowActions() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      alert(`Edit row ${id}`);
      // Here you can open a modal or enable editing in the row
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (confirm(`Delete row ${id}?`)) {
        btn.closest("tr").remove();
      }
    });
  });
}

loadTableData();
loadReport();
const db = firebase.firestore();

    // Get reportId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get("reportId");

    const reportDetails = document.getElementById("reportDetails");
    const qaNotes = document.getElementById("qaNotes");
    const saveBtn = document.getElementById("saveQABtn");

    // Load report data
    async function loadReport() {
      if (!reportId) {
        reportDetails.innerHTML = "<p><strong>Error:</strong> No report ID provided.</p>";
        saveBtn.disabled = true;
        return;
      }

      try {
        const doc = await db.collection("reports").doc(reportId).get();
        if (doc.exists) {
          const data = doc.data();
          reportDetails.innerHTML = `
            <p><strong>Report Title:</strong> ${data.title || "N/A"}</p>
            <p><strong>Status:</strong> ${data.status || "N/A"}</p>
            <p><strong>Frequency:</strong> ${data.frequency || "N/A"}</p>
            <p><strong>Last Updated:</strong> ${data.updatedAt || "N/A"}</p>
          `;
          qaNotes.value = data.qaNotes || "";
        } else {
          reportDetails.innerHTML = "<p>Report not found.</p>";
        }
      } catch (err) {
        console.error(err);
        reportDetails.innerHTML = "<p>Error loading report data.</p>";
      }
    }

    // 🧩 Populate Table with Sample Rows A-R
const qaTableBody = document.getElementById("qaTableBody");

function loadTableData() {
  qaTableBody.innerHTML = "";
  for (let i = 1; i <= 5; i++) { // create 5 sample rows
    const row = document.createElement("tr");
    for (let j = 0; j < 18; j++) {
      const cell = document.createElement("td");
      cell.textContent = String.fromCharCode(65 + j); // A–R
      row.appendChild(cell);
    }

    // Add Edit/Delete buttons
    const actionCell = document.createElement("td");
    actionCell.innerHTML = `
      <button class="action-btn edit-btn" data-id="${i}">Edit</button>
      <button class="action-btn delete-btn" data-id="${i}">Delete</button>
    `;
    row.appendChild(actionCell);

    qaTableBody.appendChild(row);
  }

  attachRowActions();
}

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


    // Save QA notes
    saveBtn.addEventListener("click", async () => {
      try {
        await db.collection("reports").doc(reportId).update({
          qaNotes: qaNotes.value,
          qaUpdatedAt: new Date().toISOString(),
        });
        alert("QA Notes saved successfully!");
      } catch (err) {
        console.error(err);
        alert("Error saving QA notes.");
      }
    });
const dept = urlParams.get("dept");
const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  if (dept) {
    // Go back to the specific department’s reports
    window.location.href = `view-reports.html?dept=${encodeURIComponent(dept)}`;
  } else {
    // Default fallback
    window.location.href = "view-reports.html";
  }
});

    loadReport();
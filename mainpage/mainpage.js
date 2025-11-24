// =========================
// FIREBASE INITIALIZATION
// =========================
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

// Display logged-in username
const username = localStorage.getItem("username");
document.getElementById("loggedUsername").innerText = username || "No user";

// =========================
// LOAD TOTAL COUNTS
// =========================
function loadTotals() {
  db.collection("departments").where("publishStatus","==","Published")
    .onSnapshot(snap => document.getElementById("totalDepartments").innerText = snap.size);

  db.collection("reports")
    .onSnapshot(snap => document.getElementById("totalReports").innerText = snap.size);

  db.collection("charts")
    .onSnapshot(snap => document.getElementById("totalCharts").innerText = snap.size);

  db.collection("departments").where("license","==",true)
    .onSnapshot(snap => document.getElementById("totalLicenses").innerText = snap.size);
}

// =========================
// LOAD SUMMARY TABLE
// =========================
async function loadSummary() {
  const tbody = document.getElementById("summaryTableBody");
  tbody.innerHTML = "";

  const snapshot = await db.collection("reports").get();
  snapshot.forEach(async doc => {
    const r = doc.data();
    let deptName = r.departmentName || r.department || "-";

    if (r.departmentRef) {
      try {
        const depDoc = await r.departmentRef.get();
        deptName = depDoc.exists ? depDoc.data().name : "-";
      } catch(e) { console.error(e); }
    }

    const steps = [
      {name:"Data QA", done:r.dataQAComplete},
      {name:"Chart List", done:r.chartListComplete},
      {name:"DB QA", done:r.dbQAComplete},
      {name:"DB Published", done:r.dbPublishedComplete}
    ];

    const stepsHTML = steps.map((s,i)=>`<span class="step-circle ${s.done?"step-complete":""}" title="${s.name}">${i+1}</span>`).join('');

    const row = document.createElement("tr");
    row.innerHTML = `<td>${r.title||"-"}</td><td>${deptName}</td><td class="steps-cell"><div class="steps">${stepsHTML}</div></td>`;
    tbody.appendChild(row);
  });
}

// =========================
// CALENDAR
// =========================
let calendar;

function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    editable: true,
    selectable: true,
    select(info){ openEventModal(info.startStr); },
    eventClick(info){ openEventModal(info.event.startStr, info.event); }
  });

  calendar.render();
  loadCalendarEvents();
  addReportAlertsToCalendar();
}

// =========================
// LOAD EVENTS
// =========================
function loadCalendarEvents() {
  db.collection("calendarEvents").get().then(snapshot => {
    snapshot.forEach(doc => {
      const e = doc.data();
      calendar.addEvent({ id: doc.id, title:e.title, start:e.date });
    });
  });
}

// =========================
// MODAL
// =========================
const modal = document.getElementById('eventModal');
const closeModal = document.querySelector('.close');
closeModal.onclick = () => modal.style.display = 'none';

function openEventModal(date, event=null){
  modal.style.display = 'block';
  document.getElementById('eventDate').value = date;
  document.getElementById('eventTitle').value = event ? event.title : '';
  document.getElementById('saveEvent').onclick = () => saveEvent(event);
}

// =========================
// SAVE EVENT
// =========================
function saveEvent(eventObj){
  const title = document.getElementById('eventTitle').value;
  const date = document.getElementById('eventDate').value;
  if(!title||!date) return alert("Enter title & date");

  if(eventObj){
    db.collection("calendarEvents").doc(eventObj.id).update({title,date})
      .then(()=> { eventObj.setProp('title',title); eventObj.setStart(date); modal.style.display='none'; });
  } else {
    db.collection("calendarEvents").add({title,date})
      .then(docRef => { calendar.addEvent({id:docRef.id,title,start:date}); modal.style.display='none'; });
  }
}

// =========================
// AUTOMATED ALERTS
// =========================
function addReportAlertsToCalendar(){
  db.collection("reports").get().then(snapshot => {
    snapshot.forEach(doc => {
      const r = doc.data();
      if(!r.lastUpdated || !r.frequency) return;

      const lastUpdate = new Date(r.lastUpdated);
      let nextDue = new Date(lastUpdate);

      switch(r.frequency){
        case 'Quarterly': nextDue.setMonth(nextDue.getMonth()+3); break;
        case 'Monthly': nextDue.setMonth(nextDue.getMonth()+1); break;
        case 'Yearly': nextDue.setFullYear(nextDue.getFullYear()+1); break;
      }

      const today = new Date();
      if(today >= nextDue){
        calendar.addEvent({title:`Update ${r.title}`,start:nextDue.toISOString().split('T')[0],color:'red'});
      }
    });
  });
}

// =========================
// PAGE LOAD
// =========================
document.addEventListener("DOMContentLoaded", ()=>{
  loadTotals();
  loadSummary();
  initCalendar();
});

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAfWLaoabC5U8vzFQyIOScZFLKPDoZh3cE",
  authDomain: "project-monitor-f6fb2.firebaseapp.com",
  projectId: "project-monitor-f6fb2",
  storageBucket: "project-monitor-f6fb2.appspot.com", // ✅ fixed .app to .appspot.com
  messagingSenderId: "789686813125",
  appId: "1:789686813125:web:d931d3b0ae13e674248bac"
};

// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("✅ Firebase initialized:", firebase.apps.length);

// --- DOM elements ---
const form = document.getElementById('projectForm');
const tableBody = document.querySelector('#projectTable tbody');

// --- Default form submit handler ---
async function defaultSubmit(e) {
  e.preventDefault();

  const project = {
    name: document.getElementById('projectName').value,
    owner: document.getElementById('owner').value,
    status: document.getElementById('status').value,
    description: document.getElementById('description').value,
    createdAt: new Date().toISOString()
  };

  await db.collection('projects').add(project);
  form.reset();
}

form.addEventListener('submit', defaultSubmit);

// --- Real-time updates ---
db.collection('projects').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
  tableBody.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.owner}</td>
      <td>${data.status}</td>
      <td>${data.description}</td>
      <td>
        <button class="edit" onclick="editProject('${doc.id}', '${data.name}', '${data.owner}', '${data.status}', '${data.description}')">Edit</button>
        <button class="delete" onclick="deleteProject('${doc.id}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
});

// --- Delete ---
async function deleteProject(id) {
  if (confirm("Delete this project?")) {
    await db.collection('projects').doc(id).delete();
  }
}

// --- Edit ---
function editProject(id, name, owner, status, description) {
  document.getElementById('projectName').value = name;
  document.getElementById('owner').value = owner;
  document.getElementById('status').value = status;
  document.getElementById('description').value = description;
  form.onsubmit = async (e) => {
    e.preventDefault();
    await db.collection('projects').doc(id).update({
      name: document.getElementById('projectName').value,
      owner: document.getElementById('owner').value,
      status: document.getElementById('status').value,
      description: document.getElementById('description').value,
    });
    form.reset();
    form.onsubmit = defaultSubmit;
  };
}

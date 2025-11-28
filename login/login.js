const firebaseConfig = {
  apiKey: "AIzaSyAfWLaoabC5U8vzFQyIOScZFLKPDoZh3cE",
  authDomain: "project-monitor-f6fb2.firebaseapp.com",
  projectId: "project-monitor-f6fb2",
  storageBucket: "project-monitor-f6fb2.appspot.com",
  messagingSenderId: "789686813125",
  appId: "1:789686813125:web:d931d3b0ae13e674248bac"
  };
  firebase.initializeApp(firebaseConfig);

document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  if (!email || !password) {
    message.textContent = "⚠️ Please enter email and password.";
    message.style.color = "red";
    return;
  }

  // Show loading note
  message.textContent = "⏳ Logging in...";
  message.style.color = "blue";

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      message.textContent = "✅ Login successful! Redirecting...";
      message.style.color = "green";
      setTimeout(() => window.location.href = "../mainpage/mainpage.html", 1000);
    })
    .catch((error) => {
      let errorMsg = error.message;

      // New Firebase error format
      if (errorMsg.includes("INVALID_LOGIN_CREDENTIALS")) {
        errorMsg = "❌ Incorrect email or password.";
      }

      // Traditional error codes
      if (error.code === "auth/user-not-found") {
        errorMsg = "❌ No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMsg = "❌ Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "❌ Invalid email format.";
      }

      message.textContent = errorMsg;
      message.style.color = "red";
    });
});

// Automatically redirect logged-in users to dashboard
firebase.auth().onAuthStateChanged(user => {
  const message = document.getElementById("message");

  if (user) {
    message.innerHTML = `🔒 You are already logged in. <br><a href="../index.html" style="color:#004aad; font-weight:600;">Go to Dashboard</a>`;
  }
});


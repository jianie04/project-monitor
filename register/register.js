document.getElementById("registerBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");
  const button = document.getElementById("registerBtn");

  if (!email || !password) {
    message.textContent = "⚠️ Please enter email and password.";
    message.style.color = "red";
    return;
  }

  button.disabled = true;
  button.textContent = "Creating account...";
  message.textContent = "⏳ Processing registration...";
  message.style.color = "blue";

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      message.textContent = "✅ Registration successful! Please log in.";
      message.style.color = "green";

      // Prevent automatic login after registration
      firebase.auth().signOut();

      setTimeout(() => window.location.href = "../login/login.html", 1500);
    })
    .catch((error) => {
      let errorMsg = error.message;

      if (errorMsg.includes("EMAIL_EXISTS")) errorMsg = "❌ Email is already registered.";
      if (error.code === "auth/weak-password") errorMsg = "❌ Password should be at least 6 characters.";
      if (error.code === "auth/invalid-email") errorMsg = "❌ Invalid email format.";

      message.textContent = errorMsg;
      message.style.color = "red";

      button.disabled = false;
      button.textContent = "Register";
    });
});

// // Redirect logged-in users to dashboard
// firebase.auth().onAuthStateChanged(user => {
//   if (user) {
//     window.location.href = "../index.html";
//   }
// });

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.querySelector("#login-form");

  loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const errorMessage = document.querySelector("#error-message");

    try {

      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("token", data.token);
        window.location.href = "index.html?login=success";

      } else {

        errorMessage.textContent = "Email ou mot de passe incorrect.";

      }

    } catch (error) {

      errorMessage.textContent = "Erreur lors de la connexion.";

    }

  });

});
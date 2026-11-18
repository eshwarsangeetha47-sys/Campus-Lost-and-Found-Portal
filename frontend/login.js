
// Campus Lost and Found - Login

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {
            // Save login token
            localStorage.setItem("token", result.token);

            alert("Login successful!");

            // Open the correct dashboard
            if (result.user.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } else {
            alert(result.message || "Invalid email or password.");
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Server connection failed. Please try again.");
    }
});

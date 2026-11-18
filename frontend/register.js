
// Campus Lost and Found - Registration

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userData = {
        name: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert(result.message || "Registration failed.");
        }

    } catch (error) {
        console.error("Registration error:", error);
        alert("Server connection failed. Please try again.");
    }
});

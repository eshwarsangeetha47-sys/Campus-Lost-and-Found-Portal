
// Campus Lost and Found - User Dashboard

const token = localStorage.getItem("token");

// Check login
if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// Load dashboard details
async function loadDashboard() {
    try {
        // Get all campus items
        const itemsResponse = await fetch("/api/items");
        const itemsData = await itemsResponse.json();
        const items = itemsData.items || [];

        // Get user's submitted claims
        const claimsResponse = await fetch("/api/my-claims", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (claimsResponse.status === 401 || claimsResponse.status === 403) {
            alert("Please login again.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const claimsData = await claimsResponse.json();

        // Support either an array or an object containing claims
        const claims = Array.isArray(claimsData)
            ? claimsData
            : (claimsData.claims || []);

        // Update dashboard numbers
        document.getElementById("totalItems").textContent = items.length;
        document.getElementById("totalClaims").textContent = claims.length;

        const approved = claims.filter(
            claim => claim.status === "Approved"
        ).length;

        const pending = claims.filter(
            claim => claim.status === "Pending"
        ).length;

        document.getElementById("approvedClaims").textContent = approved;
        document.getElementById("pendingClaims").textContent = pending;

        // Display submitted claims
        const container = document.getElementById("claimsContainer");
        container.innerHTML = "";

        if (claims.length === 0) {
            container.textContent = "You have not submitted any claims yet.";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "item-card";

            const itemName = document.createElement("h3");
            itemName.textContent = claim.item?.itemName || "Campus Item";

            const description = document.createElement("p");
            description.textContent =
                "Claim Description: " + (claim.description || "Not provided");

            const status = document.createElement("p");
            status.textContent = "Status: " + claim.status;

            card.appendChild(itemName);
            card.appendChild(description);
            card.appendChild(status);

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        alert("Unable to load dashboard. Please try again.");
    }
}

// Logout
document.getElementById("logoutButton").addEventListener("click", function() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
});

if (token) {
    loadDashboard();
}

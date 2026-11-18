
// Campus Lost and Found - Admin Dashboard

const token = localStorage.getItem("token");

// Check login
if (!token) {
    alert("Please login as an administrator.");
    window.location.href = "login.html";
}

// Load all claims
async function loadAdminClaims() {
    const container = document.getElementById("adminClaimsContainer");

    try {
        const response = await fetch("/api/admin/claims", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert("You are not authorized to access the admin dashboard.");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();
        const claims = data.claims || [];

        container.innerHTML = "";

        if (claims.length === 0) {
            container.textContent = "No claims have been submitted.";
            return;
        }

        claims.forEach(claim => {
            const card = document.createElement("div");
            card.className = "item-card";

            const heading = document.createElement("h3");
            heading.textContent = claim.item?.itemName || "Campus Item";

            const claimant = document.createElement("p");
            claimant.textContent =
                "Claimant: " + (claim.claimant?.name || "Unknown");

            const description = document.createElement("p");
            description.textContent =
                "Description: " + (claim.description || "Not provided");

            const status = document.createElement("p");
            status.textContent = "Status: " + claim.status;

            card.appendChild(heading);
            card.appendChild(claimant);
            card.appendChild(description);
            card.appendChild(status);

            if (claim.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.addEventListener("click", function() {
                    updateClaimStatus(claim._id, "Approved");
                });

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";
                rejectButton.addEventListener("click", function() {
                    updateClaimStatus(claim._id, "Rejected");
                });

                card.appendChild(approveButton);
                card.appendChild(rejectButton);
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        container.textContent = "Unable to load claims.";
    }
}

// Update claim status
async function updateClaimStatus(claimId, status) {
    try {
        const response = await fetch("/api/admin/claims/" + claimId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ status: status })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Claim " + status + " successfully!");
            loadAdminClaims();
        } else {
            alert(result.message || "Unable to update claim.");
        }

    } catch (error) {
        console.error("Update error:", error);
        alert("Server connection failed.");
    }
}

// Logout
document.getElementById("logoutButton").addEventListener("click", function() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
});

if (token) {
    loadAdminClaims();
}


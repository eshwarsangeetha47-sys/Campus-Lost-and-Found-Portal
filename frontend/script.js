
// Get HTML elements
const itemsContainer = document.getElementById("itemsContainer");
const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-box button");
const reportForm = document.getElementById("reportForm");

// Display items on the page
function displayItems(items) {
    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";

    if (!items || items.length === 0) {
        itemsContainer.innerHTML = "<p>No items found.</p>";
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "item-card";

        card.innerHTML = `
            <h3>${item.itemName}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
            <p><strong>Type:</strong> ${item.listingType}</p>
            <p><strong>Status:</strong> ${item.status}</p>
            ${item.image ? `<img src="${item.image}" alt="${item.itemName}" width="150">` : ""}
        `;

        itemsContainer.appendChild(card);
    });
}

// Get all items from database
async function getItems() {
    try {
        const response = await fetch("/api/items");
        const data = await response.json();

        if (response.ok) {
            displayItems(data.items);
        } else {
            itemsContainer.innerHTML = "<p>Unable to load items.</p>";
        }
    } catch (error) {
        console.log(error);
        if (itemsContainer) {
            itemsContainer.innerHTML = "<p>Unable to connect to server.</p>";
        }
    }
}

// Search items
async function searchItems() {
    const keyword = searchInput ? searchInput.value.trim() : "";
    const category = document.getElementById("searchCategory")?.value || "";
    const location = document.getElementById("searchLocation")?.value.trim() || "";
    const listingType = document.getElementById("searchListingType")?.value || "";
    const sortDate = document.getElementById("sortDate").value;

    const searchParams = new URLSearchParams();

    if (keyword) searchParams.append("keyword", keyword);
    if (category) searchParams.append("category", category);
    if (location) searchParams.append("location", location);
    if (listingType) searchParams.append("listingType", listingType);
    if (sortDate) searchParams.append("sortDate", sortDate);

    try {
        const response = await fetch("/api/search?" + searchParams.toString());
        const data = await response.json();

        if (response.ok) {
            displayItems(data.items);
        } else {
            alert("Search failed!");
        }
    } catch (error) {
        console.log(error);
        alert("Unable to search items!");
    }
}

// Search button click
if (searchButton) {
    searchButton.addEventListener("click", searchItems);
}

// Search using Enter key
if (searchInput) {
    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchItems();
        }
    });
}

// Report a lost or found item
if (reportForm) {
    reportForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const item = {
            itemName: document.getElementById("itemName").value,
            category: document.getElementById("category").value,
            description: document.getElementById("description").value,
            location: document.getElementById("location").value,
            date: document.getElementById("date").value,
            listingType: document.getElementById("listingType").value
        };

        try {
            const response = await fetch("/api/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Item reported successfully!");
                reportForm.reset();
                getItems();
            } else {
                alert(data.message || "Unable to report item.");
            }
        } catch (error) {
            console.log(error);
            alert("Server error. Please try again.");
        }
    });
}

// Register a new user
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const user = {
            name: document.getElementById("registerName").value,
            email: document.getElementById("registerEmail").value,
            password: document.getElementById("registerPassword").value
        };

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");
                registerForm.reset();
            } else {
                alert(data.message || "Registration failed.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to register.");
        }
    });
}

// Login user
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const user = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Login successful!");
                loginForm.reset();
            } else {
                alert(data.message || "Login failed.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to login.");
        }
    });
}

// Logout user
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        alert("Logged out successfully!");
    });
}

// Submit a claim
const claimForm = document.getElementById("claimForm");

if (claimForm) {
    claimForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login before submitting a claim.");
            return;
        }

        const claim = {
            itemId: document.getElementById("claimItemId").value,
            description: document.getElementById("claimDescription").value
        };

        try {
            const response = await fetch("/api/claims", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(claim)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Claim submitted successfully!");
                claimForm.reset();
            } else {
                alert(data.message || "Claim submission failed.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to submit claim.");
        }
    });
}

// View my submitted claims
const viewClaimsButton = document.getElementById("viewClaimsButton");

if (viewClaimsButton) {
    viewClaimsButton.addEventListener("click", async function () {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            const response = await fetch("/api/my-claims", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();
            const claimsContainer = document.getElementById("claimsContainer");

            if (response.ok) {
                claimsContainer.innerHTML = "";

                if (data.claims.length === 0) {
                    claimsContainer.innerHTML = "<p>No claims submitted yet.</p>";
                    return;
                }

                data.claims.forEach((claim) => {
                    const div = document.createElement("div");
                    div.className = "item-card";

                    div.innerHTML = `
                        <h3>${claim.item ? claim.item.itemName : "Item"}</h3>
                        <p><strong>Description:</strong> ${claim.description}</p>
                        <p><strong>Status:</strong> ${claim.status}</p>
                    `;

                    claimsContainer.appendChild(div);
                });
            } else {
                alert(data.message || "Unable to get claims.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to load your claims.");
        }
    });
}

// View all claims in admin dashboard
const viewAdminClaimsButton = document.getElementById("viewAdminClaimsButton");

if (viewAdminClaimsButton) {
    viewAdminClaimsButton.addEventListener("click", async function () {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            const response = await fetch("/api/admin/claims", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const data = await response.json();
            const adminClaimsContainer = document.getElementById("adminClaimsContainer");

            if (response.ok) {
                adminClaimsContainer.innerHTML = "";

                if (data.claims.length === 0) {
                    adminClaimsContainer.innerHTML = "<p>No claims available.</p>";
                    return;
                }

                data.claims.forEach((claim) => {
                    const div = document.createElement("div");
                    div.className = "item-card";

                    div.innerHTML = `
                        <h3>${claim.item ? claim.item.itemName : "Item"}</h3>
                        <p><strong>Claimant:</strong> ${claim.claimant ? claim.claimant.name : "Unknown"}</p>
                        <p><strong>Description:</strong> ${claim.description}</p>
                        <p><strong>Status:</strong> ${claim.status}</p>

                        ${claim.status === "Pending" ? `
                            <button onclick="updateClaimStatus('${claim._id}', 'Approved')">Approve</button>
                            <button onclick="updateClaimStatus('${claim._id}', 'Rejected')">Reject</button>
                        ` : ""}
                    `;

                    adminClaimsContainer.appendChild(div);
                });
            } else {
                alert(data.message || "Unable to load admin claims.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to load admin claims.");
        }
    });
}

// Approve or reject a claim
async function updateClaimStatus(claimId, status) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {
        const response = await fetch("/api/admin/claims/" + claimId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ status: status })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Claim " + status + " successfully!");
            document.getElementById("viewAdminClaimsButton").click();
        } else {
            alert(data.message || "Unable to update claim.");
        }
    } catch (error) {
        console.log(error);
        alert("Unable to update claim.");
    }
}

// View user dashboard
const viewDashboardButton = document.getElementById("viewDashboardButton");

if (viewDashboardButton) {
    viewDashboardButton.addEventListener("click", async function () {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        try {
            const itemsResponse = await fetch("/api/items");
            const itemsData = await itemsResponse.json();

            const claimsResponse = await fetch("/api/my-claims", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            const claimsData = await claimsResponse.json();

            if (itemsResponse.ok && claimsResponse.ok) {
                const claims = claimsData.claims;

                document.getElementById("totalItems").textContent =
                    itemsData.items.length;

                document.getElementById("totalClaims").textContent =
                    claims.length;

                document.getElementById("approvedClaims").textContent =
                    claims.filter(claim => claim.status === "Approved").length;

                document.getElementById("pendingClaims").textContent =
                    claims.filter(claim => claim.status === "Pending").length;
            } else {
                alert("Unable to load dashboard.");
            }
        } catch (error) {
            console.log(error);
            alert("Unable to load dashboard.");
        }
    });
}

// Load items when page opens
getItems();

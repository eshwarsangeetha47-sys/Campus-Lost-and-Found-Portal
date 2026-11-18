
 // Campus Lost and Found - Browse Items

const API_URL = "/api";

// Display items on the page
function displayItems(items) {
    const container = document.getElementById("itemsContainer");

    if (items.length === 0) {
        container.innerHTML = "<p>No items found.</p>";
        return;
    }

    container.innerHTML = "";

    items.forEach(item => {
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
            ${item.image ? `<img src="${item.image}" alt="Item image" width="150">` : ""}
        `;

        // Add Claim button only for Found items
        if (item.listingType === "Found") {
            const claimButton = document.createElement("button");
            claimButton.textContent = "Claim";
            claimButton.addEventListener("click", () => submitClaim(item._id));

            card.appendChild(claimButton);
        }

        container.appendChild(card);
    });
}

// Submit a claim
async function submitClaim(itemId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login before submitting a claim.");
        window.location.href = "login.html";
        return;
    }

    const description = prompt("Explain why this item belongs to you:");

    if (!description || description.trim() === "") {
        alert("Please enter a claim description.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/claims`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                itemId: itemId,
                description: description.trim()
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Claim submitted successfully!");
        } else {
            alert(data.message || "Unable to submit claim.");
        }

    } catch (error) {
        console.error("Claim error:", error);
        alert("Something went wrong while submitting your claim.");
    }
}

// Load all items
async function getItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const data = await response.json();

        displayItems(data.items || []);

    } catch (error) {
        console.error("Error loading items:", error);

        document.getElementById("itemsContainer").innerHTML =
            "<p>Unable to load items. Please try again.</p>";
    }
}

// Search and filter items
async function searchItems() {
    const keyword = document.getElementById("keyword").value;
    const category = document.getElementById("category").value;
    const location = document.getElementById("location").value;
    const listingType = document.getElementById("listingType").value;
    const sortDate = document.getElementById("sortDate").value;

    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (listingType) params.append("listingType", listingType);
    if (sortDate) params.append("sortDate", sortDate);

    try {
        const response = await fetch(
            `${API_URL}/search?${params.toString()}`
        );

        const data = await response.json();

        displayItems(data.items || []);

    } catch (error) {
        console.error("Search error:", error);
        alert("Unable to search items.");
    }
}

// Search button
document.getElementById("searchButton").addEventListener("click", searchItems);

// Load items when page opens
getItems();

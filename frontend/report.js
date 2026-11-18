
// Campus Lost and Found - Report Item

const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // Get form values
    const itemName = document.getElementById("itemName").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const listingType = document.getElementById("listingType").value;

    // Prepare item data
    const itemData = {
        itemName: itemName,
        category: category,
        description: description,
        location: location,
        date: date,
        listingType: listingType
    };

    try {
        const response = await fetch("/api/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Item reported successfully!");
            reportForm.reset();
        } else {
            alert(result.message || "Unable to report item.");
        }

    } catch (error) {
        console.error("Report error:", error);
        alert("Server connection failed. Please try again.");
    }
});

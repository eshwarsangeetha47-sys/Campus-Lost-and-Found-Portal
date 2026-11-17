
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Item = require("./models/Item");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const Claim = require("./models/Claim");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Frontend connection
app.use(express.static(path.join(__dirname, "frontend")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error.message);
    });

// Test API
app.get("/api/status", (req, res) => {
    res.json({
        message: "Campus Lost and Found Backend is Working!"
    });
});
// User Registration
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// Add Lost or Found Item
app.post("/api/items", async (req, res) => {
    try {
        const newItem = new Item(req.body);

        const savedItem = await newItem.save();

        res.status(201).json({
            message: "Item added successfully!",
            item: savedItem
        });

    } catch (error) {
        res.status(400).json({
            message: "Error adding item",
            error: error.message
        });
    }
});
// User Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});
// Get User Profile (Protected Route)
app.get("/api/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile fetched successfully!",
            user: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile",
            error: error.message
        });
    }
});

// Submit Claim
app.post("/api/claims", auth, async (req, res) => {
    try {
        const { itemId, description } = req.body;

        if (!itemId || !description) {
            return res.status(400).json({
                message: "Item ID and description are required"
            });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        const newClaim = new Claim({
            item: itemId,
            claimant: req.user.id,
            description: description
        });

        await newClaim.save();

        res.status(201).json({
            message: "Claim submitted successfully!",
            claim: newClaim
        });

    } catch (error) {
        res.status(500).json({
            message: "Error submitting claim",
            error: error.message
        });
    }
});
// Get My Claims
app.get("/api/my-claims", auth, async (req, res) => {
    try {
        const claims = await Claim.find({
            claimant: req.user.id
        })
        .populate("item")
        .populate("claimant", "name email");

        res.status(200).json({
            message: "Claims fetched successfully!",
            claims: claims
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching claims",
            error: error.message
        });
    }
});
// Get All Claims (Admin)
app.get("/api/admin/claims", auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        const claims = await Claim.find()
            .populate("item")
            .populate("claimant", "name email");

        res.status(200).json({
            message: "All claims fetched successfully!",
            claims: claims
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching claims",
            error: error.message
        });
    }
});
// Approve or Reject a Claim (Admin)
app.put("/api/admin/claims/:id", auth, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        const { status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Approved or Rejected"
            });
        }

        const claim = await Claim.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        res.status(200).json({
            message: "Claim status updated successfully!",
            claim: claim
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating claim",
            error: error.message
        });
    }
});
// Search and Filter Items

app.get("/api/search", async (req, res) => {
    try {
        const { keyword, category, location, listingType, sortDate } = req.query;

        let filter = {};

        if (keyword) {
            filter.$or = [
                { itemName: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (listingType) {
            filter.listingType = listingType;
        }

        let query = Item.find(filter);

        if (sortDate === "newest") {
            query = query.sort({ date: -1 });
        } else if (sortDate === "oldest") {
            query = query.sort({ date: 1 });
        }

        const items = await query;

        res.status(200).json({
            message: "Search completed successfully!",
            items
        });

    } catch (error) {
        res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
});


// Get All Lost and Found Items
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find();

        res.status(200).json({
            message: "Items fetched successfully!",
            items: items
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching items",
            error: error.message
        });
    }
});
// Get Item by ID
app.get("/api/items/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item fetched successfully!",
            item: item
        });

    } catch (error) {
        res.status(400).json({
            message: "Invalid item ID",
            error: error.message
        });
    }
});
// Delete Item
app.delete("/api/items/:id", async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item deleted successfully!"
        });

    } catch (error) {
        res.status(400).json({
            message: "Error deleting item",
            error: error.message
        });
    }
});
// Update Item
app.put("/api/items/:id", async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        res.status(200).json({
            message: "Item updated successfully!",
            item: updatedItem
        });

    } catch (error) {
        res.status(400).json({
            message: "Error updating item",
            error: error.message
        });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



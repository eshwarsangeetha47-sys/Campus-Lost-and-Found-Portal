const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Please login."
            });
        }

        const decoded = jwt.verify(
            token.replace("Bearer ", ""),
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = auth;
const express = require("express")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'mySuperSecretCookieKey123!';

// Middleware
app.use(cors({
    origin: 'http://localhost', // Your frontend URL
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));

// Routes
const venueRoutes = require("./routes/venueRoutes")
const authRoutes = require("./routes/authRoutes")

app.use("/api/venues", venueRoutes)
app.use("/api/auth", authRoutes)

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Jkpg City API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
})
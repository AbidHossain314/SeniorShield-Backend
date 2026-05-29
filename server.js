import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import connectDB from "./mongodb.js";
import twilio from "twilio";

// Import your new calendar routes (from the previous step)
import calendarRoutes from "./routes/calendarRoutes.js"; 

const app = express();
const server = http.createServer(app); // Wrap express in HTTP to allow WebSockets

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["https://seniorshield.netlify.app", "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
}));

// Setup Socket.io (The Magic Tube for ESP32 real-time alerts)
const io = new Server(server, {
    cors: {
        origin: ["https://seniorshield.netlify.app", "http://localhost:3000", "http://127.0.0.1:3000"], // Crucial for Socket.io
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    }
});

// Basic check to see if server is alive
app.get("/", (req, res) => {
  res.send("✅ SeniorShield Server is running!");
});

// Use Calendar Routes
app.use("/api/calendar", calendarRoutes);


// --- TWILIO SOS SETUP ---
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const sosMessages = [
  "Dad is feeling very weak. Please call as soon as possible! 💔",
  "Mom is having chest pain! Urgent help needed! 🚑",
  "I fell down and need assistance. Please respond fast! 🚨",
];

app.post("/send-sos", async (req, res) => {
  try {
    const randomMessage = sosMessages[Math.floor(Math.random() * sosMessages.length)];
    const message = await client.messages.create({
      body: randomMessage,
      from: "+15732675589",
      to: req.body.to,
    });
    res.status(200).json({ success: true, messageSid: message.sid });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// --- ESP32 FALL DETECTION SETUP ---

// Detect when the Netlify frontend connects to the socket
io.on('connection', (socket) => {
    console.log('📱 Frontend connected to the Magic Tube!');
});

// The URL where your ESP32 will POST its sensor data
app.post('/api/sensor-data', (req, res) => {
    const { heartRate, fallDetected } = req.body;
    
    console.log(`📡 Received from ESP32 -> Heart Rate: ${heartRate}, Fall Detected: ${fallDetected}`);

    // If fall is detected, blast alert down the socket tube to Netlify!
    if (fallDetected === true || fallDetected === "true") {
        console.log("🚨 FALL DETECTED! Alerting frontend...");
        io.emit('emergency-fall', { message: "Fall detected by ESP32!" });
    }

    res.status(200).json({ message: "Data received by Brain" });
});


// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
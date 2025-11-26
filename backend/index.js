import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv"; 


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server (required for socket.io)
const server = http.createServer(app);

// Create socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// TEMP DATABASE (In-memory)
let students = [];
let activeQuestion = null;
let answers = {}; // { socketId: "A", etc. }

// SOCKET.IO CONNECTION
io.on("connection", (socket) => {
  console.log("Student/Teacher connected:", socket.id);

  // Student joins with a name
  socket.on("join", (name) => {
    students.push({ id: socket.id, name });
    console.log("Student joined:", name);

    io.emit("studentsUpdate", students);
  });

  // Teacher creates a new question
  socket.on("newQuestion", (questionData) => {
    activeQuestion = questionData;
    answers = {}; // reset old answers

    io.emit("questionStarted", activeQuestion);
  });

  // Student submits an answer
  socket.on("submitAnswer", (answer) => {
    answers[socket.id] = answer;

    // Update teacher about each response
    io.emit("answersUpdate", answers);

    // If all students answered → show results
    if (Object.keys(answers).length === students.length) {
      io.emit("showResults", answers);
    }
  });

  socket.on("disconnect", () => {
    students = students.filter(s => s.id !== socket.id);
    io.emit("studentsUpdate", students);
  });
});

// EXPRESS ROUTE
app.get("/", (req, res) => {
  res.send("Polling backend is running.");
});

// START SERVER
const PORT = process.env.PORT ;
server.listen(PORT, () => {
  console.log("Server running on : " + PORT);
});

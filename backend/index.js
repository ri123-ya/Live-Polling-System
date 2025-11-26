import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// ============= IN-MEMORY STORAGE =============
let students = []; // { id: socketId, name: "John" }
let activeQuestion = null; // { questionNumber, question, options, correctAnswer, timeLimit }
let answers = {}; // { socketId: selectedOptionId }
let questionTimer = null;
let questionActive = false;
let questionStartTime = null;

// ============= HELPER FUNCTIONS =============

function calculateResults() {
  if (!activeQuestion || !activeQuestion.options) return [];

  const totalAnswers = Object.keys(answers).length;
  
  // Count answers for each option
  const optionCounts = {};
  activeQuestion.options.forEach(opt => {
    optionCounts[opt.id] = 0;
  });

  Object.values(answers).forEach(answerId => {
    if (optionCounts[answerId] !== undefined) {
      optionCounts[answerId]++;
    }
  });

  // Calculate percentages
  const results = activeQuestion.options.map(opt => ({
    id: opt.id,
    label: opt.text,
    percentage: totalAnswers > 0 
      ? Math.round((optionCounts[opt.id] / totalAnswers) * 100) 
      : 0,
    count: optionCounts[opt.id],
    isCorrect: opt.isCorrect
  }));

  return results;
}

function showResults() {
  questionActive = false;
  
  if (questionTimer) {
    clearTimeout(questionTimer);
    questionTimer = null;
  }

  const results = calculateResults();
  
  io.emit("showResults", {
    questionNumber: activeQuestion.questionNumber,
    question: activeQuestion.question,
    results: results,
    totalStudents: students.length,
    totalAnswers: Object.keys(answers).length
  });

  console.log(`Results shown - ${Object.keys(answers).length}/${students.length} students answered`);
}

function getTimeRemaining() {
  if (!questionStartTime || !activeQuestion) return 0;
  
  const elapsed = Date.now() - questionStartTime;
  const timeLimit = activeQuestion.timeLimit === "30 seconds" ? 30000 : 60000;
  const remaining = Math.max(0, timeLimit - elapsed);
  
  return Math.ceil(remaining / 1000); // Return seconds
}

// ============= SOCKET.IO EVENTS =============

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send current state to newly connected client
  socket.emit("studentsUpdate", students);
  
  if (questionActive && activeQuestion) {
    socket.emit("questionStarted", {
      ...activeQuestion,
      timeRemaining: getTimeRemaining()
    });
  }

  // ===== STUDENT JOINS =====
  socket.on("join", (name) => {
    if (students.some(s => s.id === socket.id)) {
      socket.emit("error", "Already joined");
      return;
    }
    
    students.push({ id: socket.id, name });
    console.log(`✅ Student joined: ${name} (${socket.id})`);

    io.emit("studentsUpdate", students);
    
    // If question is active, send it to new student
    if (questionActive && activeQuestion) {
      socket.emit("questionStarted", {
        ...activeQuestion,
        timeRemaining: getTimeRemaining()
      });
    } else {
      socket.emit("waitingForQuestion");
    }
  });

  // ===== TEACHER CREATES NEW QUESTION =====
  socket.on("newQuestion", (questionData) => {
    // Reset everything for new question
    activeQuestion = questionData;
    answers = {};
    questionActive = true;
    questionStartTime = Date.now();
    
    // Clear any existing timer
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
    
    console.log(`📝 New question started: "${questionData.question}"`);
    console.log(`⏱️  Time limit: ${questionData.timeLimit}`);
    
    // Broadcast question to all students
    io.emit("questionStarted", {
      ...activeQuestion,
      timeRemaining: questionData.timeLimit === "30 seconds" ? 30 : 60
    });
    
    // Set timeout based on timeLimit
    const timeLimit = questionData.timeLimit === "30 seconds" ? 30000 : 60000;
    questionTimer = setTimeout(() => {
      console.log("⏰ Question timeout - showing results");
      showResults();
    }, timeLimit);
  });

  // ===== STUDENT SUBMITS ANSWER =====
  socket.on("submitAnswer", (selectedOptionId) => {
    // Validate submission
    if (!questionActive) {
      socket.emit("error", "No active question");
      return;
    }
    
    if (answers[socket.id]) {
      socket.emit("error", "You already answered");
      return;
    }
    
    const student = students.find(s => s.id === socket.id);
    if (!student) {
      socket.emit("error", "You must join first");
      return;
    }

    // Record answer
    answers[socket.id] = selectedOptionId;
    const answerText = activeQuestion.options.find(o => o.id === selectedOptionId)?.text || "Unknown";
    console.log(`✔️  ${student.name} answered: ${answerText}`);
    
    // Confirm to the student
    socket.emit("answerSubmitted");
    
    // Update answer count for everyone
    io.emit("answerCount", {
      count: Object.keys(answers).length,
      total: students.length
    });
    
    // Check if all students answered
    if (Object.keys(answers).length === students.length && students.length > 0) {
      console.log("✅ All students answered - showing results");
      clearTimeout(questionTimer);
      showResults();
    }
  });

  // ===== TEACHER REQUESTS CURRENT RESULTS (OPTIONAL) =====
  socket.on("getResults", () => {
    const results = calculateResults();
    socket.emit("currentResults", {
      questionNumber: activeQuestion?.questionNumber,
      question: activeQuestion?.question,
      results: results,
      totalStudents: students.length,
      totalAnswers: Object.keys(answers).length,
      isActive: questionActive
    });
  });

  // ===== DISCONNECT =====
  socket.on("disconnect", () => {
    const disconnectedStudent = students.find(s => s.id === socket.id);
    students = students.filter(s => s.id !== socket.id);
    delete answers[socket.id];
    
    io.emit("studentsUpdate", students);
    
    if (disconnectedStudent) {
      console.log(`❌ Student disconnected: ${disconnectedStudent.name}`);
    }
    
    // Update answer count
    if (questionActive) {
      io.emit("answerCount", {
        count: Object.keys(answers).length,
        total: students.length
      });
      
      // Check if all remaining students answered
      if (students.length > 0 && Object.keys(answers).length === students.length) {
        clearTimeout(questionTimer);
        showResults();
      }
    }
  });
});

// ============= EXPRESS ROUTES =============

app.get("/", (req, res) => {
  res.send("Polling backend is running.");
});

app.get("/status", (req, res) => {
  res.json({
    students: students.length,
    activeQuestion: questionActive,
    answers: Object.keys(answers).length
  });
});

// ============= START SERVER =============

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
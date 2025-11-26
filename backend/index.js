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
let students = [];
let activeQuestion = null;
let answers = {};
let questionTimer = null;
let questionActive = false;
let questionStartTime = null;

// ============= HELPER FUNCTIONS =============

function calculateResults() {
  if (!activeQuestion || !activeQuestion.options) return [];

  const totalAnswers = Object.keys(answers).length;
  
  // Count answers for each option (using display numbers 1, 2, 3, 4)
  const optionCounts = {};
  activeQuestion.options.forEach((opt, index) => {
    optionCounts[index + 1] = 0; // Use 1, 2, 3, 4 as keys
  });

  Object.values(answers).forEach(answerNumber => {
    if (optionCounts[answerNumber] !== undefined) {
      optionCounts[answerNumber]++;
    }
  });

  // Calculate percentages - use sequential numbers
  const results = activeQuestion.options.map((opt, index) => {
    const displayNumber = index + 1;
    return {
      id: displayNumber, // Sequential: 1, 2, 3, 4
      label: opt.text,
      percentage: totalAnswers > 0 
        ? Math.round((optionCounts[displayNumber] / totalAnswers) * 100) 
        : 0,
      count: optionCounts[displayNumber],
      isCorrect: opt.isCorrect
    };
  });

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
  
  return Math.ceil(remaining / 1000);
}

// ============= SOCKET.IO EVENTS =============

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Send current state to newly connected client
  socket.emit("studentsUpdate", students);
  
  if (questionActive && activeQuestion) {
    // Transform options to use sequential numbers for display
    const questionForClient = {
      ...activeQuestion,
      options: activeQuestion.options.map((opt, index) => ({
        id: index + 1, // Send 1, 2, 3, 4 to frontend
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      timeRemaining: getTimeRemaining()
    };
    
    socket.emit("questionStarted", questionForClient);
  } else if (activeQuestion && !questionActive) {
    // Question exists but timer ended - send results immediately
    const results = calculateResults();
    socket.emit("showResults", {
      questionNumber: activeQuestion.questionNumber,
      question: activeQuestion.question,
      results: results,
      totalStudents: students.length,
      totalAnswers: Object.keys(answers).length
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
      const questionForClient = {
        ...activeQuestion,
        options: activeQuestion.options.map((opt, index) => ({
          id: index + 1,
          text: opt.text,
          isCorrect: opt.isCorrect
        })),
        timeRemaining: getTimeRemaining()
      };
      socket.emit("questionStarted", questionForClient);
    } else {
      socket.emit("waitingForQuestion");
    }
  });

  // ===== TEACHER CREATES NEW QUESTION =====
  socket.on("newQuestion", (questionData) => {
    // Store question with original structure
    activeQuestion = {
      questionNumber: questionData.questionNumber,
      question: questionData.question,
      options: questionData.options, // Keep original options array
      timeLimit: questionData.timeLimit,
      correctAnswer: questionData.correctAnswer
    };
    
    answers = {};
    questionActive = true;
    questionStartTime = Date.now();
    
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
    
    console.log(`📝 New question started: "${questionData.question}"`);
    console.log(`⏱️  Time limit: ${questionData.timeLimit}`);
    console.log(`📊 Options:`, questionData.options.map(o => o.text));
    
    // Transform options to sequential numbers for frontend
    const questionForClient = {
      questionNumber: activeQuestion.questionNumber,
      question: activeQuestion.question,
      options: activeQuestion.options.map((opt, index) => ({
        id: index + 1, // 1, 2, 3, 4
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      timeLimit: activeQuestion.timeLimit,
      timeRemaining: questionData.timeLimit === "30 seconds" ? 30 : 60
    };
    
    io.emit("questionStarted", questionForClient);
    
    // Set timeout
    const timeLimit = questionData.timeLimit === "30 seconds" ? 30000 : 60000;
    questionTimer = setTimeout(() => {
      console.log("⏰ Question timeout - showing results");
      showResults();
    }, timeLimit);
  });

  // ===== STUDENT SUBMITS ANSWER =====
  socket.on("submitAnswer", (selectedNumber) => {
    // selectedNumber is now 1, 2, 3, or 4
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

    // Validate answer is in range
    if (selectedNumber < 1 || selectedNumber > activeQuestion.options.length) {
      socket.emit("error", "Invalid answer");
      return;
    }

    // Record answer (store the display number: 1, 2, 3, 4)
    answers[socket.id] = selectedNumber;
    
    const answerText = activeQuestion.options[selectedNumber - 1]?.text || "Unknown";
    console.log(`✔️  ${student.name} answered: ${selectedNumber}. ${answerText}`);
    
    socket.emit("answerSubmitted");
    
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

  // ===== TEACHER REQUESTS CURRENT RESULTS =====
  socket.on("getResults", () => {
    console.log("📡 Teacher requested current results");
    
    // Case 1: No question exists at all
    if (!activeQuestion) {
      console.log("No active question exists");
      socket.emit("currentResults", {
        questionNumber: null,
        question: null,
        results: [],
        totalStudents: students.length,
        totalAnswers: 0,
        isActive: false
      });
      return;
    }

    // Case 2: Question exists
    const results = calculateResults();
    console.log(`Sending results: active=${questionActive}, question="${activeQuestion.question}"`);
    
    socket.emit("currentResults", {
      questionNumber: activeQuestion.questionNumber,
      question: activeQuestion.question,
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
    
    if (questionActive) {
      io.emit("answerCount", {
        count: Object.keys(answers).length,
        total: students.length
      });
      
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
    answers: Object.keys(answers).length,
    question: activeQuestion?.question || null
  });
});

// ============= START SERVER =============

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
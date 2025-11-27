import { useState, useEffect } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import { socket } from "../../connection";
import { useNavigate } from "react-router-dom";

export default function QuizQuestionTeacher() {
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [answerCount, setAnswerCount] = useState({ count: 0, total: 0 });
  const [showingResults, setShowingResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔌 Setting up socket listeners");
    console.log("🔗 Socket connected:", socket.connected);

    // Ensure socket is connected
    if (!socket.connected) {
      console.log("🔌 Connecting socket...");
      socket.connect();
    }

    // Listen for question started
    socket.on("questionStarted", (data) => {
      console.log("📨 Question started event received:", data);
      setQuestionData({
        questionNumber: data.questionNumber,
        question: data.question,
        options: data.options,
        results: [] // No results yet
      });
      setShowingResults(false);
      setLoading(false);
    });

    // Listen for answer count updates
    socket.on("answerCount", (data) => {
      console.log("📊 Answer count update:", data);
      setAnswerCount(data);
    });

    // Listen for final results
    socket.on("showResults", (data) => {
      console.log("🎯 Final results received:", data);
      setQuestionData({
        questionNumber: data.questionNumber,
        question: data.question,
        results: data.results
      });
      setAnswerCount({ count: data.totalAnswers, total: data.totalStudents });
      setShowingResults(true);
      setLoading(false);
    });

    // Listen for current results response
    socket.on("currentResults", (data) => {
      console.log("📥 Current results received:", data);
      
      if (data.isActive && data.question) {
        // Question is still active, show waiting screen
        setQuestionData({
          questionNumber: data.questionNumber,
          question: data.question,
          results: []
        });
        setAnswerCount({ count: data.totalAnswers, total: data.totalStudents });
        setShowingResults(false);
        setLoading(false);
      } else if (!data.isActive && data.question && data.results && data.results.length > 0) {
        // Question ended, show results
        setQuestionData({
          questionNumber: data.questionNumber,
          question: data.question,
          results: data.results
        });
        setAnswerCount({ count: data.totalAnswers, total: data.totalStudents });
        setShowingResults(true);
        setLoading(false);
      } else {
        // No question
        console.log("No question available");
        setLoading(false);
      }
    });

    // Wait for socket to connect, then request current state
    const requestState = () => {
      if (socket.connected) {
        console.log("📡 Requesting current results from server...");
        socket.emit("getResults");
      } else {
        console.log("⏳ Waiting for socket connection...");
        setTimeout(requestState, 100);
      }
    };

    // Request state after a short delay to ensure connection
    setTimeout(requestState, 200);

    // After 3 seconds, if still no data, stop loading
    const timer = setTimeout(() => {
      console.log("⏰ Timeout reached, stopping loading");
      setLoading(false);
    }, 3000);

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("questionStarted");
      socket.off("answerCount");
      socket.off("showResults");
      socket.off("currentResults");
      clearTimeout(timer);
    };
  }, []); // Only run once on mount

  const handleAskNewQuestion = () => {
    console.log("➕ Ask new question clicked");
    // Clear state
    setShowingResults(false);
    setQuestionData(null);
    setAnswerCount({ count: 0, total: 0 });
    
    // Navigate to teacher page
    // window.location.href = "/teacher";
    navigate("/teacher");
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <div
          className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm"
          style={{ background: "linear-gradient(90deg, #7565D9, #4D0ACD)" }}
        >
          <Sparkles size={18} />
          Intervue Poll
        </div>

        <div
          className="w-16 h-16 rounded-full animate-spin mb-6 mt-6"
          style={{
            border: "4px solid transparent",
            borderTop: "4px solid #7565D9",
            borderRight: "4px solid #6A5DD3",
            borderBottom: "4px solid #5750CD",
          }}
        ></div>

        <p className="text-2xl font-bold text-gray-800">
          Loading...
        </p>
      </div>
    );
  }

  // Waiting for results (question asked, collecting answers)
  if (!showingResults && questionData) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center pt-10 px-4 relative">
        <div
          className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm mb-6"
          style={{ background: "linear-gradient(90deg, #7565D9, #4D0ACD)" }}
        >
          <Sparkles size={18} />
          Intervue Poll
        </div>

        <div className="w-full max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Question {questionData.questionNumber}
            </h2>
          </div>

          <div className="border border-gray-300 rounded-xl shadow-sm">
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-3 rounded-t-xl text-sm font-medium">
              {questionData.question}
            </div>
            <div className="p-8 text-center">
              <div className="animate-pulse">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-200"></div>
                <p className="text-gray-600">Waiting for students to answer...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {answerCount.count} / {answerCount.total} students answered
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#5767D0" }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  // Results Screen
  if (showingResults && questionData && questionData.results) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center pt-10 px-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-4">
          <h2 className="text-lg font-semibold">
            Question {questionData.questionNumber}
          </h2>
        </div>

        {/* Question Card */}
        <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm pb-4">
          <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-3 rounded-t-xl text-sm font-medium">
            {questionData.question}
          </div>

          <div className="p-4 space-y-3">
            {questionData.results.map((res) => (
              <ResultBar
                key={res.id}
                number={res.id}
                label={res.label}
                percentage={res.percentage}
                count={res.count}
                isCorrect={res.isCorrect}
              />
            ))}
          </div>
        </div>

        {/* Ask New Question button */}
        <div className="w-full max-w-xl flex justify-end">
          <button
            onClick={handleAskNewQuestion}
            className="mt-8 text-white text-lg px-10 py-3 rounded-full font-medium shadow-lg transition-all hover:scale-105"
            style={{ background: "linear-gradient(90deg, #7765DA, #5767D0)" }}
          >
            + Ask New Question
          </button>
        </div>

        {/* Chat Button */}
        {/* <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#5767D0" }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button> */}
      </div>
    );
  }

  // No question data - waiting for teacher to start a question
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div
        className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm mb-6"
        style={{ background: "linear-gradient(90deg, #7565D9, #4D0ACD)" }}
      >
        <Sparkles size={18} />
        Intervue Poll
      </div>
      <p className="text-xl text-gray-600 mt-6 text-center">
        No active question or results to display
      </p>
      <button
        onClick={handleAskNewQuestion}
        className="mt-6 text-white text-lg px-10 py-3 rounded-full font-medium shadow-lg transition-all hover:scale-105"
        style={{ background: "linear-gradient(90deg, #7765DA, #5767D0)" }}
      >
        + Ask New Question
      </button>
    </div>
  );
}

function ResultBar({ number, label, percentage, count, isCorrect }) {
  return (
    <div className="relative w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden px-4 py-3">
      <div
        className="absolute left-0 top-0 h-full transition-all duration-500"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: "#7765DA"
        }}
      ></div>

      <div className="relative flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-6 h-6 rounded-full border border-gray-300 bg-white flex items-center justify-center font-bold text-sm z-10 shrink-0 text-purple-600">
            {number}
          </div>
          <span className="text-gray-800 font-medium">{label}</span>
        </div>
        <span className="text-gray-900 font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
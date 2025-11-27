import { useState, useEffect } from "react";
import { MessageSquare, Sparkles, Timer } from "lucide-react";
import { socket } from "../../connection";

export default function QuestionPage() {
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [resultsData, setResultsData] = useState(null);

  useEffect(() => {
    // Listen for new question
    socket.on("questionStarted", (data) => {
      console.log("Question received:", data);
      setQuestionData({
        questionNumber: data.questionNumber,
        question: data.question,
        options: data.options
      });
      setTimeRemaining(data.timeRemaining || 60);
      setSelected(null);
      setSubmitted(false);
      setShowResults(false);
      setResultsData(null);
      setLoading(false);
    });

    // Listen for results
    socket.on("showResults", (data) => {
      console.log("Results received:", data);
      setResultsData(data);
      setShowResults(true);
    });

    // Listen for waiting state
    socket.on("waitingForQuestion", () => {
      setLoading(true);
      setQuestionData(null);
    });

    // Listen for answer confirmation
    socket.on("answerSubmitted", () => {
      console.log("Answer confirmed by server");
    });

    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      socket.off("questionStarted");
      socket.off("showResults");
      socket.off("waitingForQuestion");
      socket.off("answerSubmitted");
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = () => {
    if (selected === null || submitted) return;

    setSubmitted(true);
    socket.emit("submitAnswer", selected);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          Wait for the teacher to ask questions..
        </p>

        <button
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#5767D0" }}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-10 px-4 relative">
      {/* Header */}
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto mb-4">
        <h2 className="text-lg font-semibold">
          Question {questionData?.questionNumber}
        </h2>
        {!showResults && (
          <div className="flex gap-1 items-center">
            <Timer size={14} />
            <span className="text-red-500 font-semibold text-sm">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm pb-4">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-3 rounded-t-xl text-sm font-medium">
          {questionData?.question}
        </div>

        <div className="p-4 space-y-3">
          {showResults && resultsData
            ? resultsData.results.map((res) => (
                <ResultBar
                  key={res.id}
                  number={res.id}
                  label={res.label}
                  percentage={res.percentage}
                  isCorrect={res.isCorrect}
                  wasSelected={selected === res.id}
                />
              ))
            : questionData?.options.map((option) => (
                <Option
                  key={option.id}
                  number={option.id}
                  label={option.text}
                  active={selected === option.id}
                  onClick={() => setSelected(option.id)}
                  disabled={submitted}
                />
              ))}
        </div>
      </div>

      {/* Submit Button or Waiting Message */}
      {!showResults ? (
        <div className="w-full max-w-xl flex justify-end">
          <button
            disabled={selected === null || submitted}
            onClick={handleSubmit}
            className="mt-6 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(90deg, #7765DA, #5767D0)",
            }}
          >
            {submitted ? "Submitting.." : "Submit"}
          </button>
        </div>
      ) : (
        <div className="w-full flex justify-center mt-6">
          <p className="text-center text-lg font-medium text-gray-800">
            Wait for the teacher to ask a new question..
          </p>
        </div>
      )}

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

function Option({ number, label, active, onClick, disabled }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`w-full px-4 py-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${
        active ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-gray-50"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
          active ? "bg-purple-600" : "bg-gray-400"
        }`}
      >
        {number}
      </div>
      <span className="text-gray-800 text-sm">{label}</span>
    </div>
  );
}

function ResultBar({ number, label, percentage, isCorrect, wasSelected }) {
  return (
    <div className={`relative w-full bg-gray-100 border rounded-lg overflow-hidden px-4 py-3 ${
      isCorrect ? 'border-purple-500' : 'border-gray-300'
    }`}>
      <div
        className="absolute left-0 top-0 h-full transition-all duration-500"
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: "#7765DA" 
        }}
      ></div>

      <div className="relative flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-sm z-10 shrink-0 `}>
            {number}
          </div>
          <span className="text-gray-800 font-medium">
            {label}
            {wasSelected && ' (Your answer)'}
          </span>
        </div>
        <span className="text-gray-900 font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}
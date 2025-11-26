import { useState, useEffect } from "react";
import { MessageSquare, Sparkles, Timer } from "lucide-react";

export default function QuestionPage() {
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load first question
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuestionData({
        questionNumber: 1,
        timer: "00:15",
        question: "Which planet is known as the Red Planet?",
        options: [
          { id: 1, label: "Mars" },
          { id: 2, label: "Venus" },
          { id: 3, label: "Jupiter" },
          { id: 4, label: "Saturn" },
        ],
        results: [
          { id: 1, label: "Mars", percentage: 75 },
          { id: 2, label: "Venus", percentage: 5 },
          { id: 3, label: "Jupiter", percentage: 5 },
          { id: 4, label: "Saturn", percentage: 15 },
        ],
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // After showing results → wait 4s → load Q2 automatically
  useEffect(() => {
    if (showResults && questionData?.questionNumber === 1) {
      const timer = setTimeout(() => {
        setQuestionData({
          questionNumber: 2,
          timer: "00:20",
          question: "Which is the largest planet in our solar system?",
          options: [
            { id: 1, label: "Earth" },
            { id: 2, label: "Jupiter" },
            { id: 3, label: "Mars" },
            { id: 4, label: "Venus" },
          ],
          results: [],
        });
        setSelected(null);
        setSubmitted(false);
        setShowResults(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [showResults, questionData?.questionNumber]);

  const handleSubmit = () => {
    if (selected === null) return;

    setSubmitted(true);
    setTimeout(() => setShowResults(true), 800);
  };

  // Loading Screen (100% same as yours)
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
          Question {questionData.questionNumber}
        </h2>
        <div className="flex gap-1 items-center">
          <Timer size={14} />
          <span className="text-red-500 font-semibold text-sm">
            {questionData.timer}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-xl border border-gray-300 rounded-xl shadow-sm pb-4">
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-3 rounded-t-xl text-sm font-medium">
          {questionData.question}
        </div>

        <div className="p-4 space-y-3">
          {showResults
            ? questionData.results.map((res) => (
                <ResultBar
                  key={res.id}
                  number={res.id}
                  label={res.label}
                  percentage={res.percentage}
                />
              ))
            : questionData.options.map((option) => (
                <Option
                  key={option.id}
                  number={option.id}
                  label={option.label}
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
            className="mt-6 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all"
            style={{
              background: "linear-gradient(90deg, #7765DA, #5767D0)",
            }}
          >
            {submitted ? "Submitting..." : "Submit"}
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
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: "#5767D0" }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
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

function ResultBar({ number, label, percentage }) {
  return (
    <div className="relative w-full bg-gray-100 border border-gray-300 rounded-lg overflow-hidden px-4 py-3">
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: `${percentage}%`, backgroundColor: "#7765DA" }}
      ></div>

      <div className="relative flex justify-between items-center">
       <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-purple-600 font-bold text-sm z-10 shrink-0">
          {number}
        </div>
        <span className="text-gray-800 font-medium">{label}</span>
       </div>
        <span className="text-gray-900 font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}

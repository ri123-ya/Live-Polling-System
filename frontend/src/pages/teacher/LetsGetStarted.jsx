import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function LetsGetStartedTeacher() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { id: 1, text: "Rahul Bajaj", isCorrect: true },
    { id: 2, text: "Rahul Bajaj", isCorrect: false },
  ]);
  const [timeLimit, setTimeLimit] = useState("60 seconds");

  // Only one option can be correct
  const setCorrectAnswer = (selectedIndex) => {
    setOptions(
      options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === selectedIndex,
      }))
    );
  };

  const updateOptionText = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { id: Date.now(), text: "", isCorrect: false }]);
  };

  const askQuestion = () => {
    console.log("Question:", question);
    console.log("Time Limit:", timeLimit);
    console.log("Options:", options);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 pt-10">
      <div className="w-full max-w-3xl">
        {/* Header */}
        {/* Tag */}
        <div
          className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm mb-6 w-fit"
          style={{
            background: "linear-gradient(90deg, #7565D9, #4D0ACD)",
          }}
        >
          <Sparkles size={18} />
          Intervue Poll
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-gray-900">
            Let’s Get Started
          </h1>
          <p className="text-gray-600 mt-2">
            you’ll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Question Input + Timer */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-lg font-semibold text-gray-900">
              Enter your question
            </label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            >
              <option>30 seconds</option>
              <option>60 seconds</option>
            </select>
          </div>

          <div
            className="relative rounded-lg p-4"
            style={{ background: "#F2F2F2" }}
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="eg - What is the capital of India?"
              className="w-full h-24 bg-transparent border-none resize-none focus:outline-none text-gray-800 placeholder-gray-500"
              maxLength={100}
            />
            <span className="absolute bottom-3 right-4 text-sm text-gray-500">
              {question.length}/100
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8"></div>
            <h3
              className="text-base font-medium text-gray-900"
              style={{ width: "400px" }}
            >
              Edit Options
            </h3>
            <h3 className="text-base font-medium text-gray-900">
              Is it Correct?
            </h3>
          </div>

          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-4">
              {/* Number Circle */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>

              {/* Option Text Input */}
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOptionText(index, e.target.value)}
                placeholder="Enter option"
                className="h-12 px-4 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800"
                style={{
                  background: "#F2F2F2",
                  width: "400px",
                }}
              />

              {/* Correct Answer Radio */}
              <div className="flex items-center gap-6 min-w-[140px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-answer-${index}`}
                    checked={option.isCorrect}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-gray-700 text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-answer-${index}`}
                    checked={!option.isCorrect}
                    onChange={() => {}}
                    className="w-4 h-4 text-gray-400"
                  />
                  <span className="text-gray-500 text-sm">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Option */}
        <button
          onClick={addOption}
          className="mb-1 text-purple-600 font-medium border border-purple-600 rounded-lg px-6 py-3 hover:bg-purple-50 transition"
        >
          + Add More option
        </button>

        {/* Ask Question Button */}
        <div className="flex justify-end">
          <button
            onClick={askQuestion}
            className="mt-14 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all"
            style={{
              background: "linear-gradient(90deg, #7765DA, #5767D0)",
            }}
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}

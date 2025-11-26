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
          
          <div className="relative bg-gray-100 rounded-lg p-4">
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
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Options
            </h3>
            <h3 className="text-lg font-semibold text-gray-800">
              Is it Correct?
            </h3>
          </div>

          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-6">
              {/* Number Circle */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              {/* Option Text Input */}
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOptionText(index, e.target.value)}
                placeholder="Enter option"
                className="flex-1 h-14 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />

              {/* Correct Answer Radio */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-600"
                  />
                  <span className="text-gray-700 font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={!option.isCorrect}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-5 h-5 text-gray-400"
                  />
                  <span className="text-gray-500">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Option */}
        <button
          onClick={addOption}
          className="mb-12 text-purple-600 font-medium border border-purple-600 rounded-lg px-6 py-3 hover:bg-purple-50 transition"
        >
          + Add More option
        </button>

        {/* Ask Question Button */}
        <div className="flex justify-center">
          <button
            onClick={askQuestion}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Ask Question
          </button>
        </div>
      </div>
    </div>
  );
}

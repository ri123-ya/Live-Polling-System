import { useState } from "react";

export default function QuestionPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-16">

      {/* Question Number + Timer */}
      <div className="flex items-center gap-4 w-[900px] mx-auto">
        <h2 className="text-2xl font-semibold">Question 1</h2>
        <span className="text-red-500 font-semibold text-lg">00:15</span>
      </div>

      {/* Question Box */}
      <div className="w-[900px] border border-gray-300 rounded-xl mt-6 pb-6">
        
        {/* Top heading */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-t-xl text-lg font-medium">
          Which planet is known as the Red Planet?
        </div>

        {/* Options */}
        <div className="p-4 space-y-4">
          <Option number={1} label="Mars" active={selected === 1} onClick={() => setSelected(1)} />
          <Option number={2} label="Venus" active={selected === 2} onClick={() => setSelected(2)} />
          <Option number={3} label="Jupiter" active={selected === 3} onClick={() => setSelected(3)} />
          <Option number={4} label="Saturn" active={selected === 4} onClick={() => setSelected(4)} />
        </div>
      </div>

      {/* Submit Button */}
      <div className="w-[900px] flex justify-end mt-10">
        <button
          disabled={selected === null}
          className="w-[220px] py-3 rounded-full text-white text-lg disabled:opacity-50"
          style={{
            background: "linear-gradient(90deg, #7765DA, #5767D0)",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function Option({ number, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`w-full p-4 rounded-lg border cursor-pointer flex items-center gap-4 ${
        active ? "border-purple-500 bg-purple-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
          active ? "bg-purple-600" : "bg-gray-400"
        }`}
      >
        {number}
      </div>

      <span className="text-gray-800">{label}</span>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparkleIcon } from "lucide-react";

export default function LetsGetStartedStudent() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-20">
      {/* Tag */}
      <div
        className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm"
        style={{
          background: "linear-gradient(90deg, #7565D9, #4D0ACD)",
        }}
      >
        <SparkleIcon size={16} />
        Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-semibold mt-8 text-center text-black">
        Let’s <span className="font-bold">Get Started</span>
      </h1>

      {/* Subtext */}
      <p className="text-gray-600 text-lg text-center mt-4 max-w-2xl leading-relaxed">
        If you’re a student, you’ll be able to{" "}
        <span className="font-bold">submit your answers</span>, participate in
        live polls, and see how your responses compare with your classmates.
      </p>

      {/* Input Block */}
      <div className="mt-10 flex flex-col items-center w-full">
        <div className="w-[600px] flex flex-col items-center text-left">
          <label className="text-black text-lg mb-2">Enter your Name</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-[440px] px-4 py-2 border border-gray-300 rounded-lg bg-[#f3f3f3] text-black text-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => navigate("/student/questions")}
        disabled={name.trim().length === 0}
        className="mt-14 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all"
        style={{
          background: "linear-gradient(90deg, #7765DA, #5767D0)",
        }}
      >
        Continue
      </button>
    </div>
  );
}

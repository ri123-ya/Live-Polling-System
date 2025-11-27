import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("student");

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white pt-20 px-4">
      
      {/* Tag */}
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-600">Intervue Poll</span>
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-3">
        Welcome to the Live Polling System
      </h1>

      <p className="text-gray-600 text-center max-w-xl mb-10 px-2">
        Please select the role that best describes you to begin using the live polling system.
      </p>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        
        {/* Student Card */}
        <div
          onClick={() => setSelected("student")}
          className={`w-full max-w-[360px] h-[140px] rounded-xl p-6 cursor-pointer transition-all
            ${selected === "student" ? "border-2" : "border"}
          `}
          style={{
            borderColor: selected === "student" ? "#5767D0" : "#E5E5E5",
            background: selected === "student" ? "#FDFDFF" : "white",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">I'm a Student</h2>
          <p className="text-gray-600 text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </div>

        {/* Teacher Card */}
        <div
          onClick={() => setSelected("teacher")}
          className={`w-full max-w-[360px] h-[140px] rounded-xl p-6 cursor-pointer transition-all
            ${selected === "teacher" ? "border-2" : "border"}
          `}
          style={{
            borderColor: selected === "teacher" ? "#5767D0" : "#E5E5E5",
            background: selected === "teacher" ? "#FDFDFF" : "white",
          }}
        >
          <h2 className="text-lg font-semibold mb-2">I'm a Teacher</h2>
          <p className="text-gray-600 text-sm">
            Submit answers and view live poll results in real-time.
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() =>
          navigate(selected === "student" ? "/student" : "/teacher")
        }
        className="mt-14 text-white text-lg px-16 py-3 rounded-full font-medium shadow-lg transition-all"
        style={{
          background: "linear-gradient(90deg, #7765DA, #5767D0)",
        }}
      >
        Continue
      </button>
    </div>
  );
}

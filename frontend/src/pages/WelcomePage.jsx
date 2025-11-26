import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesIcon } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("student");

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white pt-20">

      {/* Tag */}
      <div className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm"
         style={{
          background: "linear-gradient(90deg, #7565D9, #4D0ACD)"
        }}
      >  
        <SparklesIcon size={18} />
        Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-semibold mt-8 text-center text-black">
        Welcome to the <span className="font-bold">Live Polling System</span>
      </h1>

      <p className="text-gray-500 text-lg text-center mt-3 max-w-xl">
        Please select the role that best describes you to begin using the live polling system
      </p>

      {/* Cards */}
      <div className="flex gap-8 mt-12">

        {/* Student Card */}
        <div
          onClick={() => setSelected("student")}
          className={`w-[360px] h-[140px] rounded-xl p-6 cursor-pointer transition-all
            ${selected === "student"
              ? "border-2"
              : "border"
            }`}
          style={{
            borderColor: selected === "student" ? "#5767D0" : "#E5E5E5",
            background: selected === "student" ? "#FDFDFF" : "white",
          }}
        >
          <p className="text-xl font-semibold text-black">I'm a Student</p>
          <p className="text-gray-700 text-sm mt-2 leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </p>
        </div>

        {/* Teacher Card */}
        <div
          onClick={() => setSelected("teacher")}
          className={`w-[360px] h-[140px] rounded-xl p-6 cursor-pointer transition-all
            ${selected === "teacher"
              ? "border-2"
              : "border"
            }`}
          style={{
            borderColor: selected === "teacher" ? "#5767D0" : "#E5E5E5",
            background: selected === "teacher" ? "#FDFDFF" : "white",
          }}
        >
          <p className="text-xl font-semibold text-black">I'm a Teacher</p>
          <p className="text-gray-700 text-sm mt-2 leading-relaxed">
            Submit answers and view live poll results in real-time.
          </p>
        </div>

      </div>

      {/* Continue Button */}
      <button
        onClick={() =>
          navigate(selected === "student" ? "/student" : "/teacher")
        }
        className="mt-14 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all"
        style={{
          background: "linear-gradient(90deg, #7765DA, #5767D0)"
        }}
      >
        Continue
      </button>

    </div>
  );
}

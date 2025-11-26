import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { socket } from "../../connection";

export default function LetsGetStartedStudent() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (name.trim().length === 0) return;
    
    setLoading(true);
    
    // Connect to socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }
    
    // Wait for connection then join
    socket.on('connect', () => {
      socket.emit("join", name.trim());
      
      // Navigate immediately after joining
      setTimeout(() => {
        navigate("/student/questions", { state: { studentName: name.trim() } });
      }, 500);
    });
    
    // If already connected, just join
    if (socket.connected) {
      socket.emit("join", name.trim());
      setTimeout(() => {
        navigate("/student/questions", { state: { studentName: name.trim() } });
      }, 500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-20">
      {/* Tag */}
      <div
        className="flex items-center gap-1 px-4 py-1.5 rounded-full text-white text-sm"
        style={{
          background: "linear-gradient(90deg, #7565D9, #4D0ACD)",
        }}
      >
        <Sparkles size={16} />
        Intervue Poll
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-semibold mt-8 text-center text-black">
        Let's <span className="font-bold">Get Started</span>
      </h1>

      {/* Subtext */}
      <p className="text-gray-600 text-lg text-center mt-4 max-w-2xl leading-relaxed">
        If you're a student, you'll be able to{" "}
        <span className="font-bold">submit your answers</span>, participate in
        live polls, and see how your responses compare with your classmates.
      </p>

      {/* Input Block */}
      <div className="mt-10 flex flex-col items-center w-full">
        <div className="w-[600px] flex flex-col items-center">
          <label className="text-black text-lg mb-2 self-start ml-20">
            Enter your Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
            placeholder="Name"
            disabled={loading}
            className="w-[440px] px-4 py-2 border border-gray-300 rounded-lg bg-[#f3f3f3] text-black text-lg focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={name.trim().length === 0 || loading}
        className="mt-14 text-white text-lg px-14 py-3 rounded-full font-medium shadow-lg transition-all disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(90deg, #7765DA, #5767D0)"
        }}
      >
        {loading ? "Connecting..." : "Continue"}
      </button>
    </div>
  );
}
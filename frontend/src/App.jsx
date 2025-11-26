import { Routes, Route } from "react-router-dom"; 
import WelcomePage from "./pages/WelcomePage";
import LetsGetStartedStudent from "./pages/student/LetsGetStarted";
import LetsGetStartedTeacher from "./pages/teacher/LetsGetStarted";
import QuestionPage from "./pages/student/QuestionPage";
import QuizQuestion from "./pages/teacher/QuizQuestion";

function App() {

  return (
     <Routes>
       <Route path="/" element={<WelcomePage/>}/>
        <Route path="/student" element={<LetsGetStartedStudent />} />
        <Route path="/teacher" element={<LetsGetStartedTeacher />} />
        <Route path="/student/questions" element={<QuestionPage />} />
        <Route path="/teacher/questions" element={<QuizQuestion />} />
     </Routes>

    
  )
}

export default App

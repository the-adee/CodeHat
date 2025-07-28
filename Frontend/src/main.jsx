import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "./index.css";
import App from "./App";
import PageNotFound from "./errors/PageNotFoundError";
import Login from "./pages/Auth/LoginPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordConfirmation from "./pages/Auth/ResetPasswordConfirmation";
import Register from "./pages/Auth/RegistrationPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmai";
import CreateProfile from "./user-profile/CreateProfile";
import PracticePage from "./pages/Coding/PracticePage";
import ParticipatePage from "./pages/Coding/ParticipatePage";
import UserProfile from "./user-profile/UserProfile";
import EditProfile from "./user-profile/EditProfile";
import PythonCompiler from "./pages/Coding/PythonCompiler";
import AdminPanel from "./admin/AdminPanel";
import ProblemSolver from "./pages/Coding/ProblemSolver";
import ProblemSolution from "./pages/Coding/ProblemSolution";
import DeleteAccount from "./pages/Auth/DeleteAccount";
import Goodbye from "./pages/Auth/Goodbye";
import TermsOfService from "./pages/TermsOfService";
import Vision from "./pages/Vision";

import { useAuthPersistence } from "./hooks/useAuthPersistence";
import { detectFreshBrowserSession } from "./utils/sessionUtils";

// Create a wrapper component for auth logic
export const AppWithAuth = () => {
  useAuthPersistence();
  
  useEffect(() => {
    // Detect fresh browser session only once when app starts
    detectFreshBrowserSession();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password-confirmation" element={<ResetPasswordConfirmation />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/createprofile" element={<CreateProfile />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/participate" element={<ParticipatePage />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/updateprofile" element={<EditProfile />} />
        <Route path="/pythoncompiler" element={<PythonCompiler />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/solve/:id" element={<ProblemSolver />} />
        <Route path="/solve/:id/solution" element={<ProblemSolution />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/goodbye" element={<Goodbye />} />
        <Route path="/termsofservice" element={<TermsOfService />} />
        <Route path="/vision" element={<Vision />} />
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<AppWithAuth />);
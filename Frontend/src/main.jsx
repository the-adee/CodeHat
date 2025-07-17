import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import PageNotFound from "./errors/PageNotFoundError";
import Login from "./pages/Auth/LoginPage";
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
import TermsOfService from "./pages/TermsOfService";
import Vision from "./pages/Vision";

import ProtectedRoute from "./auth/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <VerifyEmailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/createprofile"
        element={
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/userprofile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/updateprofile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/participate"
        element={
          <ProtectedRoute>
            <ParticipatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pythoncompiler"
        element={
          <ProtectedRoute>
            <PythonCompiler />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solve/:id"
        element={
          <ProtectedRoute>
            <ProblemSolver />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solve/:id/solution"
        element={
          <ProtectedRoute>
            <ProblemSolution />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delete-account"
        element={
          <ProtectedRoute>
            <DeleteAccount />
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/termsofservice" element={<TermsOfService />} />
      <Route path="/vision" element={<Vision />} />
    </Routes>
  </Router>
);

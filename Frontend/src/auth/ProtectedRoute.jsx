// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { auth } from "../Firebase";

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

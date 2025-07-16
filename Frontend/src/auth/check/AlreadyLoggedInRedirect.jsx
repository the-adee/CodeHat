import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

const AlreadyLoggedInRedirect = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        navigate("/userprofile"); // or wherever you want
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return children;
};

export default AlreadyLoggedInRedirect;

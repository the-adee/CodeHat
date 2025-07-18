import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";

const Goodbye = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user came from account deletion (has state)
    if (!location.state?.fromDeletion) {
      // Redirect if accessed directly without proper flow
      navigate("/", { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, location.state]);

  // If no proper state, don't render anything (will redirect)
  if (!location.state?.fromDeletion) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Animated farewell icon */}
          <div className="mb-8 animate-bounce">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
          </div>

          {/* Main farewell message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Goodbye! 👋
          </h1>

          <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
            Your account has been successfully deleted
          </h2>

          {/* Farewell content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Thank you for being part of our{" "}
              <span className="font-semibold text-blue-600">CodeHat™</span>{" "}
              community. We're sorry to see you go, but we respect your
              decision.
            </p>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-gray-600 mb-4">
                All your data has been permanently removed from our systems,
                including:
              </p>
              <ul className="text-gray-600 space-y-2 max-w-md mx-auto">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Your profile information
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Authentication credentials
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Practice history and progress
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  All associated data
                </li>
              </ul>
            </div>
          </div>

          {/* Comeback message */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Changed your mind?</h3>
            <p className="mb-4">
              You're always welcome back! You can create a new account anytime.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition duration-200"
            >
              Create New Account
            </button>
          </div>

          {/* Countdown and navigation */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Redirecting to homepage in{" "}
              <span className="font-bold text-blue-600">{countdown}</span>{" "}
              seconds...
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Goodbye;

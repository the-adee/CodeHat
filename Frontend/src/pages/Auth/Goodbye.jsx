import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";

const Goodbye = () => {
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fromDeletion = localStorage.getItem("fromDeletion");

    if (!fromDeletion) {
      navigate("/", { replace: true });
      return;
    }

    setShowContent(true);
    localStorage.removeItem("fromDeletion");

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
  }, [navigate]);

  if (!showContent) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl mx-auto text-center bg-white rounded-xl shadow-md p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Goodbye 👋
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Your account has been successfully deleted.
          </p>

          <div className="text-left border-t border-gray-200 pt-6">
            <p className="text-gray-700 text-base mb-4">
              Thank you for being part of{" "}
              <span className="font-semibold text-blue-600">CodeHat™</span>. We
              appreciate your time with us.
            </p>
            <p className="text-gray-700 text-base mb-4">
              All your data has been permanently removed from our systems,
              including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
              <li>Your profile information</li>
              <li>Authentication credentials</li>
              <li>Practice history and progress</li>
              <li>All associated data</li>
            </ul>
          </div>

          <div className="mt-8">
            <p className="text-gray-600 mb-4">
              Redirecting to homepage in{" "}
              <span className="font-semibold text-blue-600">{countdown}</span>{" "}
              seconds...
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
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

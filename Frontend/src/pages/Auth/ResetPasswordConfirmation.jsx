import { useState, useEffect } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../../Firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import Alert from "../../components/UI/Alert";

const ResetPasswordConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");

  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        showAlert("error", "Invalid or missing reset code");
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setEmail(email);
        setValidCode(true);
      } catch (error) {
        showAlert("error", "Invalid or expired reset link");
      }
    };

    verifyCode();
  }, [oobCode]);

  const showAlert = (type, message, autoClose = true) => {
    setAlert({ show: true, type, message });
    if (autoClose) {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showAlert("error", "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      showAlert("error", "Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      showAlert("success", "Password reset successful! Redirecting to login...", false);
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      showAlert("error", "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!validCode) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm px-4">
          <Alert
            type={alert.type}
            message={alert.message}
            show={alert.show}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            autoClose={alert.type === "success" || alert.type === "error"}
            duration={5000}
          />
        </div>
      )}

      <section className="bg-gray-50 min-h-screen flex items-center">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full">
          <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Set New Password
              </h1>
              <p className="text-sm text-gray-600">
                Enter a new password for {email}
              </p>
              
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    id="confirmPassword"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ResetPasswordConfirmation;
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../Firebase";
import { Link } from "react-router-dom";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import Alert from "../../components/UI/Alert";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    message: "",
  });

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
    
    if (!email) {
      showAlert("warning", "Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // Redirect URL after password reset
        handleCodeInApp: false,
      });
      
      setEmailSent(true);
      showAlert("success", "Password reset email has been sent! Check your inbox and spam folder.", false);
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      let errorMessage = "An error occurred. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many requests. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      showAlert("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      showAlert("success", "Password reset email sent again!");
    } catch (error) {
      showAlert("error", "Failed to resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* Toast-style alert */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm px-4">
          <Alert
            type={alert.type}
            message={alert.message}
            show={alert.show}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            autoClose={alert.type === "success" || alert.type === "error"}
            duration={alert.type === "success" ? 6000 : 5000}
          />
        </div>
      )}

      <section
        className="bg-gray-50 dark:bg-white-900 px-4 lg:px-16 min-h-screen flex items-center"
        style={{
          backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
          color: "#fff",
        }}
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full lg:py-0">
          
          <a href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-black"
          >
            <span className="flex items-center text-5xl font-extrabold dark:text-white">
              CodeHat™
            </span>
          </a>

          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {!emailSent ? (
                <>
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
                    Reset your password
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                      >
                        Your email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        id="email"
                        className="bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Email"}
                    </button>

                    <div className="text-center">
                      <Link
                        to="/login"
                        className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-green-500">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-black mb-4">
                      Check your email
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={handleResendEmail}
                        className={`w-full text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                          loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Resend Email"}
                      </button>
                      
                      <Link
                        to="/login"
                        className="block w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;
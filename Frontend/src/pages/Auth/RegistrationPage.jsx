import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import Alert from "../../components/UI/Alert";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../Firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../Firebase"; // Make sure you export db from your Firebase config
import ReCAPTCHA from "react-google-recaptcha";

const RegistrationPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const recaptcha = useRef();
  const site_Key = import.meta.env.VITE_SITE_KEY;
  const backend_api = import.meta.env.VITE_BACKEND_API;

  const showAlert = (type, message, autoClose = true) => {
    setAlert({ show: true, type, message });
    if (autoClose) {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  // Username validation
  const validateUsername = (username) => {
    const errors = [];
    
    if (username.length < 3) {
      errors.push("at least 3 characters");
    }
    if (username.length > 20) {
      errors.push("maximum 20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push("only letters, numbers, and underscores");
    }
    if (/^[0-9]/.test(username)) {
      errors.push("cannot start with a number");
    }

    return errors;
  };

  // Enhanced password validation
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("one special character");
    }

    return errors;
  };

  // Check if username is already taken
  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(`${backend_api}/check-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking username:", error);
      return true; // Assume available if check fails
    }
  };

  const signUp = async (e) => {
    e.preventDefault();

    // Clear previous error messages
    setPasswordError("");
    setEmailError("");
    setUsernameError("");

    // Enhanced username validation
    const usernameErrors = validateUsername(username);
    if (usernameErrors.length > 0) {
      setUsernameError(
        `⚠️ Username must have: ${usernameErrors.join(", ")}`
      );
      return;
    }

    // Enhanced password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(
        `⚠️ Password must contain: ${passwordErrors.join(", ")}`
      );
      return;
    }

    // Check reCAPTCHA
    const captchaValue = recaptcha.current.getValue();
    if (!captchaValue) {
      showAlert("warning", "Please verify the reCAPTCHA!");
      return;
    }

    setLoading(true);

    try {
      // Check username availability
      showAlert("info", "Checking username availability...", false);
      const isUsernameAvailable = await checkUsernameAvailability(username);
      
      if (!isUsernameAvailable) {
        setUsernameError("⚠️ This username is already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // Verify reCAPTCHA
      const res = await fetch(`${backend_api}/verify`, {
        method: "POST",
        body: JSON.stringify({ captchaValue }),
        headers: {
          "content-type": "application/json",
        },
      });

      const data = await res.json();
      if (data.success) {
        showAlert("info", "Creating account...", false);

        // Proceed with registration
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const user = userCredential.user;

            try {
              // Update Firebase Auth profile with display name
              await updateProfile(user, {
                displayName: username,
              });

              // Store additional user data in Firestore
              await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                createdAt: new Date().toISOString(),
                emailVerified: false,
                profileComplete: true,
                fullProfileComplete: false,
              });

              // Mark username as taken in your backend
              await fetch(`${backend_api}/reserve-username`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  username, 
                  userId: user.uid 
                }),
              });

              // Send email verification
              await sendEmailVerification(user);

              showAlert(
                "success",
                "Registration successful! A verification email has been sent to your inbox. Please verify your email before logging in."
              );

              setLoading(false);

              // Sign out user after registration to prevent unverified access
              await auth.signOut();

              // Redirect to login page after showing success message
              setTimeout(() => {
                window.location.href = "/verify-email";
              }, 3000);

            } catch (firestoreError) {
              console.error("Error saving user data:", firestoreError);
              // Still proceed but show warning
              showAlert(
                "warning", 
                "Account created but some profile data couldn't be saved. Please update your profile after login."
              );
              
              await sendEmailVerification(user);
              await auth.signOut();
              
              setTimeout(() => {
                window.location.href = "/verify-email";
              }, 3000);
            }
          })
          .catch((error) => {
            setLoading(false);

            // Handle different Firebase auth errors
            switch (error.code) {
              case "auth/email-already-in-use":
                setEmailError(
                  "⚠️ This email is already registered. Please use a different email or try logging in."
                );
                break;
              case "auth/invalid-email":
                setEmailError("⚠️ Please enter a valid email address.");
                break;
              case "auth/weak-password":
                setPasswordError(
                  "⚠️ Password is too weak. Please choose a stronger password."
                );
                break;
              case "auth/network-request-failed":
                showAlert(
                  "error",
                  "Network error. Please check your connection and try again."
                );
                break;
              default:
                showAlert("error", "Registration failed. Please try again.");
                break;
            }
          });
      } else {
        showAlert("error", "reCAPTCHA validation failed!");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      showAlert("error", "Error during registration. Please try again.");
      setLoading(false);
    }

    recaptcha.current.reset();
  };

  return (
    <>
      <Header />

      {/* Toast-style alert - doesn't affect layout */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm px-4">
          <Alert
            type={alert.type}
            message={alert.message}
            show={alert.show}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
            autoClose={alert.type === "success" || alert.type === "error"}
            duration={alert.type === "success" ? 3000 : 5000}
          />
        </div>
      )}

      <section
        className="bg-gray-50 dark:bg-white px-4 lg:px-16 pb-20 min-h-screen flex items-center"
        style={{
          backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
          color: "#fff",
        }}
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full lg:py-0">
          
          <a href="#"
            className="flex items-center mb-6 mt-20 text-2xl font-semibold text-gray-900 dark:text-black"
          >
            <span className="flex items-center text-5xl font-extrabold dark:text-white">
              CodeHat™
            </span>
          </a>

          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
                Create your account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                action="#"
                onSubmit={signUp}
              >
                <div>
                  <label
                    htmlFor="userName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    User Name
                  </label>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    3-20 characters, letters, numbers, and underscores only
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (usernameError) setUsernameError("");
                    }}
                    name="username"
                    id="userName"
                    className={`bg-gray-50 border ${
                      usernameError ? "border-red-500" : "border-gray-300"
                    } text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    placeholder="JoeGoldberg_4"
                    required
                  />
                  {usernameError && (
                    <p className="text-sm mt-2 animate-pulse text-red-500">
                      {usernameError}
                    </p>
                  )}
                </div>

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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    name="email"
                    id="email"
                    className={`bg-gray-50 border ${
                      emailError ? "border-red-500" : "border-gray-300"
                    } text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    placeholder="abc@gmail.com"
                    required
                  />
                  {emailError && (
                    <p className="text-sm mt-2 animate-pulse text-red-500">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Password
                  </label>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Must contain: 8+ characters, uppercase, lowercase, number,
                    and special character
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className={`bg-white border ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      } text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-600 dark:text-gray-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye-slash text-gray-400"
                          viewBox="0 0 16 16"
                        >
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                          <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye text-gray-500"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-sm mt-2 animate-pulse text-red-500">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-black"
                    >
                      I accept the{" "}
                      <Link
                        to="/termsofservice"
                        className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                      >
                        Terms and Conditions
                      </Link>
                    </label>
                  </div>
                </div>

                <div className="transform scale-75 sm:scale-100 origin-left">
                  <ReCAPTCHA ref={recaptcha} sitekey={site_Key} />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create an account"}
                </button>

                <p className="text-sm font-light text-gray-500 dark:text-black">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default RegistrationPage;
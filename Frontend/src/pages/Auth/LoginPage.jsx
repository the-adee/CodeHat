import { useRef, useState } from "react";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";
import ReCAPTCHA from "react-google-recaptcha";
import Alert from "../../components/UI/Alert";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  async function submitForm(event) {
    event.preventDefault();
    const captchaValue = recaptcha.current.getValue();

    if (!captchaValue) {
      showAlert("warning", "Please verify the reCAPTCHA!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${backend_api}/verify`, {
        method: "POST",
        body: JSON.stringify({ captchaValue }),
        headers: { "content-type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        showAlert("info", "Verifying credentials...", false);

        signInWithEmailAndPassword(auth, email, password)
          .then(async (userCredential) => {
            const user = userCredential.user;
            await user.reload();

            if (!user.emailVerified) {
              showAlert(
                "warning",
                "Email not verified. Please check your inbox or spam folder."
              );
              await auth.signOut();
              setLoading(false);
              return;
            }

            // Check profile existence in backend MongoDB
            try {
              const profileRes = await fetch(
                `${backend_api}/user?email=${encodeURIComponent(user.email)}`
              );

              setLoading(false);

              if (profileRes.status === 200) {
                showAlert("success", "Login successful! Redirecting...");
                setTimeout(() => {
                  window.location.href = "/practice";
                }, 1500);
              } else if (profileRes.status === 404) {
                showAlert("success", "First login detected! Redirecting...");
                setTimeout(() => {
                  window.location.href = "/createprofile";
                }, 1500);
              } else {
                showAlert("error", "Unexpected response from server.");
              }
            } catch {
              showAlert("error", "Error checking profile. Try again.");
              setLoading(false);
            }
          })
          .catch((error) => {
            showAlert("error", "Invalid email or password!");
            setLoading(false);
          });
      } else {
        showAlert("error", "reCAPTCHA validation failed!");
        setLoading(false);
      }
    } catch (error) {
      showAlert("error", "Network error. Please try again.");
      setLoading(false);
    }

    recaptcha.current.reset();
  }

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
        className="bg-gray-50 dark:bg-white-900 px-4 lg:px-16 min-h-screen flex items-center"
        style={{
          backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
          color: "#fff",
        }}
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full lg:py-0">
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-black"
          >
            <span className="flex items-center text-5xl font-extrabold dark:text-white">
              CodeHat™
            </span>
          </a>

          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-black">
                Log in to your account
              </h1>
              <form
                className="space-y-4 md:space-y-6"
                onSubmit={submitForm}
                action="#"
                method="POST"
              >
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

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="remember"
                        className="text-black dark:text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>

                  <a
                    href="#"
                    className="text-black font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <div className="transform scale-75 sm:scale-100 origin-left">
                  <ReCAPTCHA ref={recaptcha} sitekey={site_Key} />
                </div>

                <p className="text-sm font-light text-black dark:text-gray-400">
                  Don't have an account yet?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  >
                    Register here
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

export default LoginPage;

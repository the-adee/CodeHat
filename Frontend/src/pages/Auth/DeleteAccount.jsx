import { useEffect, useState } from "react";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { auth } from "../../Firebase";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const navigate = useNavigate();
  const backend_api = import.meta.env.VITE_BACKEND_API;

  const REQUIRED_PHRASE = "Delete My Account";

  const handleDelete = async () => {
    setLoading(true);
    setStatus("");

    const user = auth.currentUser;
    if (!user) {
      setStatus("No user is currently signed in.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Delete user data from MongoDB
      await fetch(`${backend_api}/deleteuseraccount?email=${user.email}`, {
        method: "DELETE",
      });

      // Step 2: Delete Firebase Auth account
      await user.delete();

      setStatus("Account deleted successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setStatus("Please re-authenticate before deleting your account.");
      } else {
        setStatus("An error occurred. Try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="bg-white min-h-screen py-16 px-6 font-inter text-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Delete Account</h1>
          <h2 className="text-gray-500 font-medium text-base mb-8 italic">
            Warning: This action is irreversible
          </h2>

          <p className="text-[0.95rem] leading-relaxed mb-5">
            Deleting your account will permanently erase your authentication
            credentials and remove all your profile information stored with us.
            You won’t be able to recover your data after this action.
          </p>

          {!confirming ? (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              onClick={() => setConfirming(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-gray-700">
                Are you absolutely sure? Please type{" "}
                <span className="font-semibold italic">
                  "{REQUIRED_PHRASE}"
                </span>{" "}
                to confirm.
              </p>

              <input
                type="text"
                placeholder="Type here to confirm..."
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  disabled={loading || confirmationText !== REQUIRED_PHRASE}
                  className={`px-4 py-2 rounded transition text-white ${
                    confirmationText === REQUIRED_PHRASE && !loading
                      ? "bg-red-700 hover:bg-red-800"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => {
                    setConfirming(false);
                    setConfirmationText("");
                    setStatus("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {status && (
            <p className="mt-5 text-sm text-gray-600 italic">{status}</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DeleteAccount;

import { useEffect, useState } from "react";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { auth, db } from "../../Firebase"; // Import db
import { doc, deleteDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from "react-router-dom";
import NoUserError from "../../errors/NoUserError";
import { ScaleLoader } from "react-spinners";
import Alert from "../../components/UI/Alert";
import { useRef } from "react";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const DeleteAccount = () => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const backend_api = import.meta.env.VITE_BACKEND_API;
  const redirectingRef = useRef(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    message: "",
  });

  const REQUIRED_PHRASE = "Delete My Account";

  const showAlert = (type, message, autoClose = true) => {
    setAlert({ show: true, type, message });
    if (autoClose) {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async () => {
    setLoading(true);

    if (!user) {
      showAlert("error", "No user is currently signed in.");
      setLoading(false);
      return;
    }

    try {
      showAlert("info", "Deleting your account...", false);

      // Step 1: Delete Firestore user document first
      try {
        await deleteDoc(doc(db, "users", user.uid));
        console.log("Firestore user document deleted successfully");
      } catch (firestoreError) {
        console.error("Error deleting Firestore document:", firestoreError);
        // Continue with deletion even if Firestore fails
        showAlert("warning", "Some profile data couldn't be deleted, but continuing with account deletion...", false);
      }

      // Step 2: Delete from your backend/MongoDB
      try {
        await fetch(`${backend_api}/deleteuseraccount?email=${user.email}&userId=${user.uid}`, {
          method: "DELETE",
        });
        console.log("Backend user data deleted successfully");
      } catch (backendError) {
        console.error("Error deleting backend data:", backendError);
        // Continue with deletion even if backend fails
      }

      // Step 3: Delete Firebase Auth account (this should be last)
      await user.delete();

      redirectingRef.current = true;
      localStorage.setItem("fromDeletion", "true");

      showAlert("success", "Account deleted successfully. Redirecting...");
      setTimeout(() => {
        navigate("/goodbye", {
          state: { fromDeletion: true },
          replace: true,
        });
      }, 2000);

    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        showAlert(
          "warning",
          "Please re-authenticate before deleting your account. Sign out and sign in again, then try deleting your account."
        );
      } else {
        showAlert("error", "An error occurred. Please try again later.");
        console.error("Delete account error:", error);
      }
    }

    setLoading(false);
  };

  if (loadingUser) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex justify-center items-center">
          <ScaleLoader
            cssOverride={override}
            size={100}
            color={"#123abc"}
            loading={loadingUser}
          />
        </main>
        <Footer />
      </>
    );
  }

  if (!user && !redirectingRef.current) {
    return (
      <>
        <Header />
        <NoUserError />
        <Footer />
      </>
    );
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

      <main className="bg-white min-h-screen py-16 px-6 font-inter text-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Delete Account</h1>
          <h2 className="text-gray-500 font-medium text-base mb-8 italic">
            Warning: This action is irreversible
          </h2>

          <p className="text-[0.95rem] leading-relaxed mb-5">
            Deleting your account will permanently erase your authentication
            credentials and remove all your profile information stored with us.
            You won't be able to recover your data after this action.
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
                    setAlert((prev) => ({ ...prev, show: false }));
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DeleteAccount;
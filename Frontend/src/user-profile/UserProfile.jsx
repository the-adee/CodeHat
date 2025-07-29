import { useEffect, useState } from "react";
import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import NoUserError from "../errors/NoUserError";
import { ScaleLoader } from "react-spinners";
import jsPDF from "jspdf";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const backend_api = import.meta.env.VITE_BACKEND_API;
  const db = getFirestore();

  // Function to fetch user name from Firestore
  const fetchUserName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.username || userData.displayName || userData.name || "User");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
      setUserName("User");
    }
  };

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        fetchUserName(authUser.uid);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch profile data when user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.email) {
      setIsLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(
          `${backend_api}/user?email=${encodeURIComponent(user.email)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchProfileData();
  }, [user, authLoading, backend_api]);

  function formatDate(dateString) {
    const dateFromMongoDB = new Date(dateString);
    const formattedDate = `${dateFromMongoDB.getFullYear()}-${String(
      dateFromMongoDB.getMonth() + 1
    ).padStart(2, "0")}-${String(dateFromMongoDB.getDate()).padStart(2, "0")}`;
    return formattedDate;
  }

  const downloadPDFProfile = () => {
    if (!profileData) return;

    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(16);
    doc.text("User Profile", 10, y);
    y += 10;

    const addLine = (label, value) => {
      doc.setFontSize(12);
      doc.text(`${label}: ${value || "N/A"}`, 10, y);
      y += 7;
    };

    // Personal Info
    addLine("Name", `${profileData.C_FName} ${profileData.C_LName}`);
    addLine("Email", profileData.C_Email);
    addLine("Phone", profileData.C_PhoneNo);
    addLine("Gender", profileData.C_Gender);
    addLine("DOB", formatDate(profileData.C_DOB));
    addLine("Address", profileData.C_Address);
    addLine("Tagline", profileData.C_TagLine);
    addLine("Description", profileData.C_Description);
    addLine("Account Status", profileData.C_Status ? "Active" : "Inactive");

    y += 5;
    doc.setFontSize(14);
    doc.text("Experience", 10, y);
    y += 7;

    if (
      Array.isArray(profileData.C_Experience) &&
      profileData.C_Experience.length > 0
    ) {
      profileData.C_Experience.forEach((exp) => {
        const line = `• ${exp.title} at ${exp.company} (${formatDate(
          exp.startDate
        )} - ${exp.isCurrent ? "Present" : formatDate(exp.endDate)})`;
        const descLines = doc.splitTextToSize(exp.description || "", 180);

        doc.setFontSize(12);
        doc.text(line, 10, y);
        y += 6;

        if (descLines.length) {
          doc.text(descLines, 12, y);
          y += descLines.length * 6;
        }

        y += 3;
      });
    } else {
      doc.setFontSize(12);
      doc.text("No experience data available", 10, y);
      y += 6;
    }

    y += 4;
    doc.setFontSize(14);
    doc.text("Education", 10, y);
    y += 7;

    if (
      Array.isArray(profileData.C_Education) &&
      profileData.C_Education.length > 0
    ) {
      profileData.C_Education.forEach((edu) => {
        const line = `• ${edu.degree} at ${edu.institution} (${formatDate(
          edu.startDate
        )} - ${edu.isOngoing ? "Ongoing" : formatDate(edu.endDate)})`;
        const descLines = doc.splitTextToSize(edu.description || "", 180);

        doc.setFontSize(12);
        doc.text(line, 10, y);
        y += 6;

        if (descLines.length) {
          doc.text(descLines, 12, y);
          y += descLines.length * 6;
        }

        y += 3;
      });
    } else {
      doc.setFontSize(12);
      doc.text("No education data available", 10, y);
      y += 6;
    }

    const fileName = `${profileData.C_FName}_${profileData.C_LName}_Profile.pdf`;
    doc.save(fileName);
  };

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  function ensureHttps(url) {
    if (!url || typeof url !== "string") return "";
    if (!/^https?:\/\//i.test(url)) {
      return "https://" + url;
    }
    return url;
  }

  return (
    <>
      <Header />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader
            cssOverride={override}
            size={100}
            color={"#123abc"}
            loading={isLoading}
          />
        </div>
      ) : user ? (
        <div
          className="min-h-screen bg-gray-50 dark:bg-white px-4 sm:px-6 lg:px-16 py-5"
          style={{
            backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
            color: "#fff",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start">
              {/* Left Sidebar */}
              <div className="w-full lg:w-1/3 lg:sticky lg:top-4">
                {/* Profile Info Card */}
                <div className="bg-white p-4 sm:p-6 border-t-4 border-green-400 rounded-lg shadow-sm">
                  {/* Username */}
                  {userName && (
                    <div className="mb-2">
                      <span className="text-gray-500 text-sm font-medium">
                        @{userName}
                      </span>
                    </div>
                  )}

                  {/* Full Name */}
                  {profileData && (
                    <div className="mb-3">
                      <h1 className="text-gray-900 font-bold text-xl sm:text-2xl leading-8">
                        {profileData.C_FName} {profileData.C_LName}
                      </h1>
                    </div>
                  )}

                  {/* Profile Tagline */}
                  {profileData && (
                    <h3 className="text-gray-600 font-medium text-base sm:text-lg mb-4">
                      {profileData.C_TagLine}
                    </h3>
                  )}

                  {/* Account Status */}
                  <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 divide-y rounded shadow-sm">
                    <li className="flex items-center justify-between py-3">
                      <span className="text-sm sm:text-base">
                        Account Status
                      </span>
                      {profileData && (
                        <span className="bg-green-500 py-1 px-2 rounded text-white text-xs sm:text-sm">
                          {profileData.C_Status === true
                            ? "Active"
                            : "Inactive"}
                        </span>
                      )}
                    </li>
                    <li className="flex items-center justify-between py-3">
                      <span className="text-sm sm:text-base">Member since</span>
                      {profileData && (
                        <span className="text-sm sm:text-base">
                          {formatDate(profileData.C_DOJ)}
                        </span>
                      )}
                    </li>
                  </ul>
                </div>

                {/* Social Links Card */}
                <div className="bg-white p-4 sm:p-6 hover:shadow rounded-lg mt-4">
                  <div className="flex items-center space-x-3 font-semibold text-gray-900 text-lg sm:text-xl leading-8 mb-4">
                    <span className="text-green-500">
                      <svg
                        className="h-5 w-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </span>
                    <span>Connect With Me</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {/* GitHub */}
                    <div className="text-center">
                      {profileData?.C_Github ? (
                        
                        <a href={ensureHttps(profileData.C_Github)}
                          className="text-gray-700 block hover:text-gray-900 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-100 hover:opacity-80 transition-opacity"
                            src="https://img.icons8.com/ios-filled/500/000000/github.png"
                            alt="GitHub"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            GitHub
                          </span>
                        </a>
                      ) : (
                        <div
                          className="text-gray-400 cursor-not-allowed"
                          title="GitHub not provided"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-40"
                            src="https://img.icons8.com/ios-filled/500/000000/github.png"
                            alt="GitHub"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            GitHub
                          </span>
                        </div>
                      )}
                    </div>

                    {/* LinkedIn */}
                    <div className="text-center">
                      {profileData?.C_LinkedIn ? (
                        
                        <a href={ensureHttps(profileData.C_LinkedIn)}
                          className="text-gray-700 block hover:text-gray-900 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-100 hover:opacity-80 transition-opacity"
                            src="https://img.icons8.com/ios-filled/500/000000/linkedin.png"
                            alt="LinkedIn"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            LinkedIn
                          </span>
                        </a>
                      ) : (
                        <div
                          className="text-gray-400 cursor-not-allowed"
                          title="LinkedIn not provided"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-40"
                            src="https://img.icons8.com/ios-filled/500/000000/linkedin.png"
                            alt="LinkedIn"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            LinkedIn
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div className="text-center">
                      {profileData?.C_Website ? (
                        
                        <a href={ensureHttps(profileData.C_Website)}
                          className="text-gray-700 block hover:text-gray-900 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-100 hover:opacity-80 transition-opacity"
                            src="https://img.icons8.com/ios-filled/500/000000/domain.png"
                            alt="Website"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            Website
                          </span>
                        </a>
                      ) : (
                        <div
                          className="text-gray-400 cursor-not-allowed"
                          title="Website not provided"
                        >
                          <img
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full mx-auto opacity-40"
                            src="https://img.icons8.com/ios-filled/500/000000/domain.png"
                            alt="Website"
                          />
                          <span className="text-xs sm:text-sm mt-1 block">
                            Website
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="w-full lg:w-2/3 space-y-4">
                {/* About Section */}
                <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg">
                  <div className="flex items-center space-x-2 font-semibold text-gray-700 leading-8 mb-6">
                    <span className="text-green-500">
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    <span className="tracking-wide text-lg sm:text-xl">
                      About
                    </span>
                  </div>

                  {/* Professional Summary */}
                  {profileData && profileData.C_Description && (
                    <div className="mb-6">
                      <h4 className="text-gray-800 font-semibold text-base mb-3">
                        Professional Summary
                      </h4>
                      <p className="text-gray-600 text-sm leading-6">
                        {profileData.C_Description}
                      </p>
                    </div>
                  )}

                  <div className="text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            First Name
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {profileData.C_FName}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Last Name
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {profileData.C_LName}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Gender
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {profileData.C_Gender}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Contact No.
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {profileData.C_PhoneNo}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Address
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {profileData.C_Address}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Birthday
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              {formatDate(profileData.C_DOB)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Email
                          </div>
                          {profileData && (
                            <div className="text-gray-600">
                              
                              <a className="text-blue-800 hover:text-blue-900 transition-colors"
                                href={`mailto:${profileData.C_Email}`}
                              >
                                {profileData.C_Email}
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-semibold mb-1 sm:mb-0 sm:w-32 sm:flex-shrink-0">
                            Profile Views
                          </div>
                          <div className="text-gray-600">N/A</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {profileData && (
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                      <button
                        onClick={() =>
                          navigate("/updateprofile", { state: profileData })
                        }
                        className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={downloadPDFProfile}
                        className="flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03L10.75 11.364V2.75z" />
                          <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        <span>Download Profile</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Experience and Education Section */}
                <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Experience */}
                    <div>
                      <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-4">
                        <span className="text-green-500">
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </span>
                        <span className="tracking-wide text-lg">
                          Experience
                        </span>
                      </div>
                      <div className="space-y-3">
                        {profileData &&
                        profileData.C_Experience &&
                        profileData.C_Experience.length > 0 ? (
                          profileData.C_Experience.map((exp, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-gray-200 pl-4"
                            >
                              <div className="text-teal-600 font-medium">
                                {exp.title} at {exp.company}
                              </div>
                              <div className="text-gray-500 text-xs mb-1">
                                {exp.startDate && formatDate(exp.startDate)} -{" "}
                                {exp.isCurrent
                                  ? "Present"
                                  : exp.endDate && formatDate(exp.endDate)}
                              </div>
                              {exp.description && (
                                <div className="text-gray-600 text-sm">
                                  {exp.description}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm">
                            No experience data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-4">
                        <span className="text-green-500">
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path fill="#fff" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path
                              fill="#fff"
                              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                            />
                          </svg>
                        </span>
                        <span className="tracking-wide text-lg">Education</span>
                      </div>
                      <div className="space-y-3">
                        {profileData &&
                        profileData.C_Education &&
                        profileData.C_Education.length > 0 ? (
                          profileData.C_Education.map((edu, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-gray-200 pl-4"
                            >
                              <div className="text-teal-600 font-medium">
                                {edu.degree} from {edu.institution}
                              </div>
                              <div className="text-gray-500 text-xs mb-1">
                                {edu.startDate && formatDate(edu.startDate)} -{" "}
                                {edu.isOngoing
                                  ? "Ongoing"
                                  : edu.endDate && formatDate(edu.endDate)}
                             </div>
                             {edu.description && (
                               <div className="text-gray-600 text-sm">
                                 {edu.description}
                               </div>
                             )}
                           </div>
                         ))
                       ) : (
                         <div className="text-gray-500 text-sm">
                           No education data available
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     ) : (
       <NoUserError />
     )}
     <Footer />
   </>
 );
};

export default ProfilePage;
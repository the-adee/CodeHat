import { useEffect, useState } from "react";
import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
import { useNavigate } from "react-router-dom";
import { auth } from "../Firebase";
import NoUserError from "../errors/NoUserError";
import { ScaleLoader } from "react-spinners";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const backend_api = import.meta.env.VITE_BACKEND_API;

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch profile data when user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to be determined

    if (!user || !user.email) {
      setIsLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        console.log("Fetching profile for email:", user.email);
        const response = await fetch(
          `${backend_api}/user?email=${encodeURIComponent(user.email)}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Profile data received:", data);
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        // Introduce a delay of 2 seconds before setting isLoading to false
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    fetchProfileData();
  }, [user, authLoading]);

  function formatDate(dateString) {
    const dateFromMongoDB = new Date(dateString);
    const formattedDate = `${dateFromMongoDB.getFullYear()}-${String(
      dateFromMongoDB.getMonth() + 1
    ).padStart(2, "0")}-${String(dateFromMongoDB.getDate()).padStart(2, "0")}`;
    return formattedDate;
  }

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  return (
    <>
      <Header />
      {isLoading ? (
        // Render loading spinner while data is loading
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
          className="container mx-auto p-5 bg-gray-50 dark:bg-white px-4 lg:px-16"
          style={{
            backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
            color: "#fff",
          }}
        >
          <div className="md:flex no-wrap md:-mx-2 ">
            <div className="w-full md:w-3/12 md:mx-2 ">
              <div className="bg-white p-3 border-t-4 border-green-400 rounded-lg">
                <div className="image overflow-hidden">
                  <img
                    className="h-auto w-full mx-auto"
                    src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                    alt=""
                  />
                </div>
                {profileData && (
                  <h1 className="text-gray-900 font-bold text-xl leading-8 my-1">
                    {profileData.C_Name}
                  </h1>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="black"
                  className="w-5 h-5 my-1 cursor-pointer"
                  onClick={() =>
                    navigate("/updateprofile", { state: profileData })
                  }
                >
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
                {profileData && (
                  <h3 className="text-gray-600 font-lg text-semibold leading-6">
                    {profileData.C_TagLine}
                  </h3>
                )}
                {profileData && (
                  <p className="text-sm text-gray-500 hover:text-gray-600 leading-6">
                    <b>{profileData.C_Description}</b>
                  </p>
                )}

                <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                  <li className="flex items-center py-3">
                    <span>Status</span>
                    {profileData && (
                      <span className="ml-auto">
                        <span className="bg-green-500 py-1 px-2 rounded text-white text-sm">
                          {profileData.C_Status === true
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </span>
                    )}
                  </li>
                  <li className="flex items-center py-3">
                    <span>Member since</span>
                    {profileData && (
                      <span className="ml-auto">
                        {formatDate(profileData.C_DOJ)}
                      </span>
                    )}
                  </li>
                </ul>
              </div>

              <div className="my-4"></div>

              <div className="bg-white p-3 hover:shadow rounded-lg">
                <div className="flex items-center space-x-3 font-semibold  text-gray-900 text-xl leading-8">
                  <span className="text-green-500">
                    <svg
                      className="h-5 fill-current"
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
                <div className="grid grid-cols-3">
                  <div className="text-center my-2">
                    {profileData && (
                      <a href={profileData.C_Github} className="text-gray-700">
                        <img
                          className="h-16 w-16 rounded-full mx-auto"
                          src="https://img.icons8.com/ios-filled/500/000000/github.png"
                          alt=""
                        />
                        GitHub
                      </a>
                    )}
                  </div>
                  <div className="text-center my-2">
                    {profileData && (
                      <a
                        href={profileData.C_LinkedIn}
                        className="text-gray-700"
                      >
                        <img
                          className="h-16 w-16 rounded-full mx-auto"
                          src="https://img.icons8.com/ios-glyphs/500/000000/linkedin-circled--v1.png"
                          alt=""
                        />
                        LinkedIn
                      </a>
                    )}
                  </div>
                  <div className="text-center my-2">
                    <a href="#" className="text-gray-700">
                      <img
                        className="h-16 w-16 rounded-full mx-auto"
                        src="https://img.icons8.com/ios-filled/500/000000/reddit--v1.png"
                        alt=""
                      />
                      Reddit
                    </a>
                  </div>
                  <div className="text-center my-2">
                    <a href="#" className="text-gray-700">
                      <img
                        className="h-16 w-16 rounded-full mx-auto"
                        src="https://img.icons8.com/material-sharp/500/000000/twitter.png"
                        alt=""
                      />
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-9/12 mx-2 h-64">
              <div className="bg-white p-3 shadow-sm rounded-lg ">
                <div className="flex items-center space-x-2 font-semibold text-gray-700 leading-8">
                  <span className="text-green-500">
                    <svg
                      className="h-5"
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
                  <span className="tracking-wide">About</span>
                </div>
                <div className="text-gray-700">
                  <div className="grid md:grid-cols-2 text-sm">
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">First Name</div>
                      {profileData && (
                        <div className="px-4 py-2">{profileData.C_FName}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Last Name</div>
                      {profileData && (
                        <div className="px-4 py-2">{profileData.C_LName}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Gender</div>
                      {profileData && (
                        <div className="px-4 py-2">{profileData.C_Gender}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Contact No.</div>
                      {profileData && (
                        <div className="px-4 py-2">{profileData.C_PhoneNo}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">
                        Current Address
                      </div>
                      {profileData && (
                        <div className="px-4 py-2">{profileData.C_Address}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      {profileData && (
                        <div className="px-4 py-2 font-semibold">Birthday</div>
                      )}
                      {profileData && (
                        <div className="px-4 py-2">
                          {formatDate(profileData.C_DOB)}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Email.</div>
                      <div className="px-4 py-2">
                        {profileData && (
                          <a
                            className="text-blue-800"
                            href={`mailto:${profileData.C_Email}`}
                          >
                            {profileData.C_Email}
                          </a>
                        )}
                      </div>
                    </div>
                    {/* <div className="grid grid-cols-2">
                      <div className="px-4 py-2 font-semibold">Views</div>
                      <div className="px-4 py-2">3</div>
                    </div> */}
                  </div>
                </div>
                {profileData && (
                  <a href={profileData.C_FullInfo}>
                    <button className="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">
                      Show Full Information
                    </button>
                  </a>
                )}
              </div>

              <div className="my-4"></div>

              <div className="bg-white p-3 shadow-sm rounded-lg">
                <div className="grid grid-cols-2">
                  <div>
                    <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
                      <span className="text-green-500">
                        <svg
                          className="h-5"
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
                      <span className="tracking-wide">Experience</span>
                    </div>
                    <ul className="list-inside space-y-2">
                      {profileData &&
                      profileData.C_Experience &&
                      profileData.C_Experience.length > 0 ? (
                        profileData.C_Experience.map((exp, index) => (
                          <li key={index}>
                            <div className="text-teal-600">
                              {exp.title} at {exp.company}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {exp.startDate && formatDate(exp.startDate)} -{" "}
                              {exp.isCurrent
                                ? "Present"
                                : exp.endDate && formatDate(exp.endDate)}
                            </div>
                            {exp.description && (
                              <div className="text-gray-600 text-xs mt-1">
                                {exp.description}
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="text-gray-500 text-sm">
                            No experience data available
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8 mb-3">
                      <span className="text-green-500">
                        <svg
                          className="h-5"
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
                      <span className="tracking-wide">Education</span>
                    </div>
                    <ul className="list-inside space-y-2">
                      {profileData &&
                      profileData.C_Education &&
                      profileData.C_Education.length > 0 ? (
                        profileData.C_Education.map((edu, index) => (
                          <li key={index}>
                            <div className="text-teal-600">
                              {edu.degree} from {edu.institution}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {edu.startDate && formatDate(edu.startDate)} -{" "}
                              {edu.isOngoing
                                ? "Ongoing"
                                : edu.endDate && formatDate(edu.endDate)}
                            </div>
                            {edu.description && (
                              <div className="text-gray-600 text-xs mt-1">
                                {edu.description}
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li>
                          <div className="text-gray-500 text-sm">
                            No education data available
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <NoUserError />
        </>
      )}
      <Footer />
    </>
  );
};

export default ProfilePage;

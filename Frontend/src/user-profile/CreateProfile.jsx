import React, { useState, useEffect } from "react";
import HeadNavBar from "./head-nav-bar";
import FootNavBar from "./foot-nav-bar";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import NoUserError from "./nousererror";
import { css } from "@emotion/react";
import { ScaleLoader } from "react-spinners";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const ProfileCreationPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const backend_api = import.meta.env.VITE_BACKEND_API;

  const [formData, setFormData] = useState({
    C_Name: "",
    C_FName: "",
    C_LName: "",
    C_Email: "",
    C_PhoneNo: "",
    C_Gender: "",
    C_DOB: "",
    C_Address: "",
    C_TagLine: "",
    C_Description: "",
    C_Github: "",
    C_LinkedIn: "",
    C_Experience: [
      {
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        description: "",
      },
    ],
    C_Education: [
      {
        degree: "",
        institution: "",
        startDate: "",
        endDate: "",
        isOngoing: false,
        description: "",
      },
    ],
    C_FullInfo: "",
    C_Status: true,
    C_DOJ: new Date().toISOString(),
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        setFormData((prev) => ({ ...prev, C_Email: authUser.email }));

        // 🔍 Check if user already has a profile
        fetch(`${backend_api}/user?email=${authUser.email}`)
          .then((res) => {
            if (res.status === 200) {
              return res.json();
            } else {
              throw new Error("No existing profile");
            }
          })
          .then((existingProfile) => {
            // ✅ Redirect to update page if profile exists
            if (existingProfile) {
              alert("Profile already created!");
              navigate("/updateprofile", { state: existingProfile });
            }
          })
          .catch((err) => {
            console.log("No existing profile — continue creating new one");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      C_Experience: prev.C_Experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      C_Education: prev.C_Education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      C_Experience: [
        ...prev.C_Experience,
        {
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    if (formData.C_Experience.length > 1) {
      setFormData((prev) => ({
        ...prev,
        C_Experience: prev.C_Experience.filter((_, i) => i !== index),
      }));
    }
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      C_Education: [
        ...prev.C_Education,
        {
          degree: "",
          institution: "",
          startDate: "",
          endDate: "",
          isOngoing: false,
          description: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (formData.C_Education.length > 1) {
      setFormData((prev) => ({
        ...prev,
        C_Education: prev.C_Education.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.C_Name.trim()) newErrors.C_Name = "Full name is required";
    if (!formData.C_FName.trim()) newErrors.C_FName = "First name is required";
    if (!formData.C_LName.trim()) newErrors.C_LName = "Last name is required";
    if (!formData.C_Email.trim()) newErrors.C_Email = "Email is required";
    if (!formData.C_PhoneNo.trim())
      newErrors.C_PhoneNo = "Phone number is required";
    if (!formData.C_Gender) newErrors.C_Gender = "Gender is required";
    if (!formData.C_DOB) newErrors.C_DOB = "Date of birth is required";
    if (!formData.C_Address.trim()) newErrors.C_Address = "Address is required";
    if (!formData.C_TagLine.trim())
      newErrors.C_TagLine = "Tag line is required";
    if (!formData.C_Description.trim())
      newErrors.C_Description = "Description is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.C_Email && !emailRegex.test(formData.C_Email))
      newErrors.C_Email = "Please enter a valid email address";

    const phoneRegex = /^\d{10}$/;
    if (
      formData.C_PhoneNo &&
      !phoneRegex.test(formData.C_PhoneNo.replace(/\D/g, ""))
    )
      newErrors.C_PhoneNo = "Please enter a valid 10-digit phone number";

    const hasValidExperience = formData.C_Experience.some((exp) =>
      exp.title.trim()
    );
    if (!hasValidExperience)
      newErrors.C_Experience =
        "At least one experience entry with a title is required";

    const hasValidEducation = formData.C_Education.some((edu) =>
      edu.degree.trim()
    );
    if (!hasValidEducation)
      newErrors.C_Education =
        "At least one education entry with a degree is required";

    formData.C_Experience.forEach((exp, idx) => {
      if (exp.startDate && exp.endDate && !exp.isCurrent) {
        if (new Date(exp.startDate) > new Date(exp.endDate)) {
          newErrors[
            `C_Experience_Date_${idx}`
          ] = `Start date cannot be after end date for experience ${idx + 1}`;
        }
      }
    });

    formData.C_Education.forEach((edu, idx) => {
      if (edu.startDate && edu.endDate && !edu.isOngoing) {
        if (new Date(edu.startDate) > new Date(edu.endDate)) {
          newErrors[
            `C_Education_Date_${idx}`
          ] = `Start date cannot be after end date for education ${idx + 1}`;
        }
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedData = {
        ...formData,
        C_Experience: formData.C_Experience.filter((exp) => exp.title.trim()),
        C_Education: formData.C_Education.filter((edu) => edu.degree.trim()),
      };

      const response = await fetch(`${backend_api}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        alert("Profile created successfully!");
        navigate("/userprofile");
      } else {
        throw new Error("Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Error creating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <HeadNavBar />
        <div className="flex justify-center items-center h-screen">
          <ScaleLoader
            css={override}
            size={100}
            color={"#123abc"}
            loading={isLoading}
          />
        </div>
        <FootNavBar />
      </>
    );
  }

  return (
    <>
      <HeadNavBar />
      {user ? (
        <div
          className="container mx-auto p-5 bg-gray-50 dark:bg-white px-4 lg:px-16"
          style={{
            backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
            color: "#fff",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Build Your Developer Profile
              </h1>
              <p className="text-white opacity-90">
                Showcase your skills and experience to the world
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Basic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="C_Name"
                      value={formData.C_Name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="Enter your full name"
                    />
                    {errors.FIELD_NAME && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.FIELD_NAME}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Tag Line *
                    </label>
                    <input
                      type="text"
                      name="C_TagLine"
                      value={formData.C_TagLine}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="e.g., Full Stack Developer | React Specialist"
                    />
                    {errors.C_TagLine && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_TagLine}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="C_FName"
                      value={formData.C_FName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="First name"
                    />
                    {errors.C_FName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_FName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="C_LName"
                      value={formData.C_LName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="Last name"
                    />
                    {errors.C_LName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_LName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="C_Email"
                      value={formData.C_Email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="your.email@example.com"
                      disabled
                    />
                    {errors.C_Email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_Email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="C_PhoneNo"
                      value={formData.C_PhoneNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="1234567890"
                    />
                    {errors.C_PhoneNo && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_PhoneNo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="C_Gender"
                      value={formData.C_Gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    {errors.C_Gender && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_Gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="C_DOB"
                      value={formData.C_DOB}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    />
                    {errors.C_DOB && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.C_DOB}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Address *
                  </label>
                  <textarea
                    name="C_Address"
                    value={formData.C_Address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Enter your current address"
                  />
                  {errors.C_Address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.C_Address}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Summary *
                  </label>
                  <textarea
                    name="C_Description"
                    value={formData.C_Description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                    placeholder="Tell us about yourself, your skills, expertise, and what makes you unique as a developer..."
                  />
                  {errors.C_Description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.C_Description}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-green-500 mr-2">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 00-1.414-1.414l-1.5 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Social Links & Portfolio
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      name="C_Github"
                      value={formData.C_Github}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="C_LinkedIn"
                      value={formData.C_LinkedIn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio/Personal Website
                    </label>
                    <input
                      type="url"
                      name="C_FullInfo"
                      value={formData.C_FullInfo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="text-green-500 mr-2">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zM4 9a1 1 0 000 2v5a1 1 0 001 1h10a1 1 0 001-1v-5a1 1 0 000-2H4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    Professional Experience *
                  </h2>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Experience
                  </button>
                </div>

                {errors.C_Experience && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.C_Experience}
                  </p>
                )}

                <div className="space-y-6">
                  {formData.C_Experience.map((experience, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 relative"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-700">
                          Experience {index + 1}
                        </h3>
                        {formData.C_Experience.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove this experience"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={experience.title}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., Senior Frontend Developer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            type="text"
                            value={experience.company}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "company",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., Tech Company Inc."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={experience.startDate || ""}
                              onChange={(e) =>
                                handleExperienceChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={experience.endDate || ""}
                              onChange={(e) =>
                                handleExperienceChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              disabled={experience.isCurrent}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1">
                          <label className="flex items-center text-sm text-gray-700 mt-1">
                            <input
                              type="checkbox"
                              checked={experience.isCurrent || false}
                              onChange={(e) => {
                                handleExperienceChange(
                                  index,
                                  "isCurrent",
                                  e.target.checked
                                );
                                if (e.target.checked) {
                                  handleExperienceChange(index, "endDate", "");
                                }
                              }}
                              className="mr-2"
                            />
                            I currently work here
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={experience.description}
                            onChange={(e) =>
                              handleExperienceChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="Describe your responsibilities, achievements, and technologies used..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="text-green-500 mr-2">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </span>
                    Education *
                  </h2>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Education
                  </button>
                </div>

                {errors.C_Education && (
                  <p className="text-red-500 text-sm mb-4">
                    {errors.C_Education}
                  </p>
                )}

                <div className="space-y-6">
                  {formData.C_Education.map((education, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 relative"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-700">
                          Education {index + 1}
                        </h3>
                        {formData.C_Education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove this education"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Degree/Qualification *
                          </label>
                          <input
                            type="text"
                            value={education.degree}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., Bachelor of Computer Science"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution
                          </label>
                          <input
                            type="text"
                            value={education.institution}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "institution",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="e.g., University of Technology"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={education.startDate || ""}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={education.endDate || ""}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              disabled={education.isOngoing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1">
                          <label className="flex items-center text-sm text-gray-700 mt-1">
                            <input
                              type="checkbox"
                              checked={education.isOngoing || false}
                              onChange={(e) => {
                                handleEducationChange(
                                  index,
                                  "isOngoing",
                                  e.target.checked
                                );
                                if (e.target.checked) {
                                  handleEducationChange(index, "endDate", "");
                                }
                              }}
                              className="mr-2"
                            />
                            I am currently studying here
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={education.description}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                            placeholder="Describe your coursework, achievements, GPA, relevant projects..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <ScaleLoader
                          css={override}
                          size={20}
                          color={"#ffffff"}
                          loading={isSubmitting}
                        />
                        <span className="ml-3">Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Create My Profile
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    By creating your profile, you agree to showcase your
                    professional information to potential collaborators and
                    employers.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <NoUserError />
      )}
      <FootNavBar />
    </>
  );
};

export default ProfileCreationPage;

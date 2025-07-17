import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
import { useState, useEffect } from "react";
import { auth } from "../Firebase";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [problems, setProblems] = useState([]);
  const [formData, setFormData] = useState({
    problemId: "",
    title: "",
    description: "",
    difficulty: "Easy",
    solutionLink: "",
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
    solutionCode: "",
    hints: [""],
    constraints: "",
    template: "",
  });
  const [preview, setPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const backend_api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await checkAdminStatus(authUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.problemId.trim())
      newErrors.problemId = "Problem ID is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.testCases.length === 0)
      newErrors.testCases = "At least one test case is required";

    formData.testCases.forEach((testCase, index) => {
      if (!testCase.input.trim() || !testCase.expectedOutput.trim()) {
        newErrors[`testCase${index}`] =
          "Both input and expected output are required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAdminStatus = async (authUser) => {
    try {
      const token = await authUser.getIdToken();
      const response = await fetch(`${backend_api}/api/auth/check-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) {
        fetchProblems(token);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      showNotification("Error checking admin status", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async (token) => {
    try {
      const response = await fetch(`${backend_api}/api/admin/problems`, {
        headers: {
          Authorization: `Bearer ${token || (await user.getIdToken())}`,
        },
      });
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
      showNotification("Error fetching problems", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error");
      return;
    }

    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const url = editingId
        ? `${backend_api}/api/problems/${editingId}`
        : `${backend_api}/api/problems`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification(
          `Problem ${editingId ? "updated" : "added"} successfully!`
        );
        resetForm();
        fetchProblems(token);
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving problem:", error);
      showNotification("Error saving problem", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      problemId: "",
      title: "",
      description: "",
      difficulty: "Easy",
      solutionLink: "",
      testCases: [{ input: "", expectedOutput: "", isHidden: false }],
      solutionCode: "",
      hints: [""],
      constraints: "",
      template: "",
    });
    setEditingId(null);
    setPreview(false);
    setErrors({});
  };

  const handleEdit = (problem) => {
    setFormData({
      problemId: problem.problemId,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      solutionLink: problem.solutionLink,
      testCases: problem.testCases || [
        { input: "", expectedOutput: "", isHidden: false },
      ],
      solutionCode: problem.solutionCode || "",
      hints: problem.hints || [""],
      constraints: problem.constraints || "",
      template: problem.template || "",
    });
    setEditingId(problem._id);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${backend_api}/api/problems/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          showNotification("Problem deleted successfully!");
          fetchProblems(token);
        } else {
          showNotification("Error deleting problem", "error");
        }
      } catch (error) {
        console.error("Error deleting problem:", error);
        showNotification("Error deleting problem", "error");
      }
    }
  };

  const addHint = () => {
    setFormData({
      ...formData,
      hints: [...formData.hints, ""],
    });
  };

  const removeHint = (index) => {
    const newHints = formData.hints.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      hints: newHints.length > 0 ? newHints : [""],
    });
  };

  const updateHint = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({
      ...formData,
      hints: newHints,
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user || !isAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <div className="text-red-500 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Admin privileges required to access this page
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-gray-600">
              Manage coding problems and test cases
            </p>
          </div>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-6 p-4 rounded-md ${
                notification.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {notification.type === "success" ? (
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      notification.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Problem Form */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? "Edit Problem" : "Add New Problem"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem ID *
                  </label>
                  <input
                    type="text"
                    value={formData.problemId}
                    onChange={(e) =>
                      setFormData({ ...formData, problemId: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.problemId ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., #34"
                  />
                  {errors.problemId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.problemId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution Link
                  </label>
                  <input
                    type="text"
                    value={formData.solutionLink}
                    onChange={(e) =>
                      setFormData({ ...formData, solutionLink: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/solution/34"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter problem title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Markdown) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreview(!preview)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {preview ? "Edit" : "Preview"}
                  </button>
                </div>

                {preview ? (
                  <div className="w-full p-4 border border-gray-300 rounded-md bg-gray-50 min-h-40 prose max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {formData.description || "No description provided"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    rows="10"
                    placeholder="Write problem description in Markdown..."
                  />
                )}
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraints
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) =>
                    setFormData({ ...formData, constraints: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Problem constraints..."
                />
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Test Cases *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        testCases: [
                          ...formData.testCases,
                          { input: "", expectedOutput: "", isHidden: false },
                        ],
                      })
                    }
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Test Case
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">
                          Test Case {index + 1}
                        </h4>
                        <div className="flex items-center space-x-3">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={testCase.isHidden}
                              onChange={(e) => {
                                const newTestCases = [...formData.testCases];
                                newTestCases[index].isHidden = e.target.checked;
                                setFormData({
                                  ...formData,
                                  testCases: newTestCases,
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Hidden
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newTestCases = formData.testCases.filter(
                                (_, i) => i !== index
                              );
                              setFormData({
                                ...formData,
                                testCases: newTestCases,
                              });
                            }}
                            className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Input
                          </label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) => {
                              const newTestCases = [...formData.testCases];
                              newTestCases[index].input = e.target.value;
                              setFormData({
                                ...formData,
                                testCases: newTestCases,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Input for test case..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) => {
                              const newTestCases = [...formData.testCases];
                              newTestCases[index].expectedOutput =
                                e.target.value;
                              setFormData({
                                ...formData,
                                testCases: newTestCases,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            placeholder="Expected output..."
                          />
                        </div>
                      </div>

                      {errors[`testCase${index}`] && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors[`testCase${index}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Hints
                  </label>
                  <button
                    type="button"
                    onClick={addHint}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Hint
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={hint}
                        onChange={(e) => updateHint(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Hint ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeHint(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solution Code (Optional)
                </label>
                <textarea
                  value={formData.solutionCode}
                  onChange={(e) =>
                    setFormData({ ...formData, solutionCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  rows="10"
                  placeholder="Reference solution code..."
                />
              </div>

              {/* Code Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Template (Optional)
                </label>
                <textarea
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  rows="6"
                  placeholder="# Write your solution here&#10;&#10;def solution():&#10;    pass"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : editingId ? (
                    "Update Problem"
                  ) : (
                    "Add Problem"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Problems Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Existing Problems
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No problems found
                      </td>
                    </tr>
                  ) : (
                    problems.map((problem) => (
                      <tr key={problem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {problem.problemId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div
                            className="max-w-xs truncate"
                            title={problem.title}
                          >
                            {problem.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              problem.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : problem.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              problem.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {problem.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(problem)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(problem._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;

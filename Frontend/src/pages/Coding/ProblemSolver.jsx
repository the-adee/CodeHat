// ProblemSolver.jsx
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import PythonEditor from "../../components/CodeEditor/PythonEditor";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { auth } from "../../Firebase";
import NoLoginError from "../../errors/NoLoginError";
import { css } from "@emotion/react";
import { ScaleLoader } from "react-spinners";
import DisplayQuotes from "../../components/LoadingScreen/DisplayQuotes";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const SafeMarkdown = ({ content }) => {
  const [renderError, setRenderError] = useState(false);

  if (renderError) {
    // Fallback to plain text with basic formatting
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  try {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                className="rounded-lg"
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
        onError={() => setRenderError(true)}
      >
        {content}
      </ReactMarkdown>
    );
  } catch (error) {
    console.error("ReactMarkdown error:", error);
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
};

function ProblemSolver() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("# Write your solution here\n\n");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState("problem");
  const [rightPanelTab, setRightPanelTab] = useState("editor"); // New state for right panel tabs
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const backend_api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Only fetch problem if user is authenticated
        if (id) {
          await fetchProblem();
        }
      } else {
        setUser(null);
        setLoading(false); // Stop loading if no user
      }
      setTimeout(() => {
        setIsLoadingAuth(false);
      }, 2000);
    });

    return () => unsubscribe();
  }, [id]);

  // Add this right after your state declarations
  useEffect(() => {
    const handleError = (event) => {
      setError("React rendering error: " + event.error?.message);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const fetchProblem = async () => {
    if (!backend_api) {
      setError("Backend API not configured");
      setLoading(false);
      return;
    }

    if (!id) {
      setError("No problem ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backend_api}/api/problems/${id}`);

      if (!response.ok) {
        throw new Error(`Problem not found (${response.status})`);
      }

      const data = await response.json();

      setProblem(data);

      // Set initial code template if available
      if (data.template) {
        setCode(data.template);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      alert("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setCustomOutput("");
    setRightPanelTab("io"); // Switch to I/O tab when running code

    try {
      const response = await fetch(`${backend_api}/py`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code + `\n\nprint(${customInput || '""'})`,
        }),
      });

      const result = await response.json();
      setCustomOutput(result.passOrFail || "No output");
    } catch (error) {
      setCustomOutput("Error: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runTests = async () => {
    if (!problem?.testCases || problem.testCases.length === 0) {
      alert("No test cases available for this problem!");
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setRightPanelTab("io"); // Switch to I/O tab when running tests

    try {
      const response = await fetch(`${backend_api}/api/problems/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();
      setTestResults(result.results || []);

      // Show success message if all tests pass
      const passedTests = result.results.filter((r) => r.passed).length;
      const totalTests = result.results.length;

      if (passedTests === totalTests) {
        alert(`🎉 All tests passed! (${passedTests}/${totalTests})`);
      } else {
        alert(`${passedTests}/${totalTests} tests passed. Keep trying!`);
      }
    } catch (error) {
      alert("Error running tests: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (isLoadingAuth) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <div className="flex justify-center items-center h-screen">
              <ScaleLoader
                css={override}
                size={100}
                color={"#123abc"}
                loading={isLoadingAuth}
              />
              <DisplayQuotes />
            </div>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  // Show NoLoginError if user is not authenticated
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <NoLoginError />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading problem...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-160px)]">
            {/* Left Panel - Problem Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {/* Problem Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                      {problem?.problemId || "N/A"}.{" "}
                      {problem?.title || "Untitled Problem"}
                    </h1>
                    <Link
                      to={`/solve/${id}/solution`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                    >
                      View Solution →
                    </Link>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                      problem?.difficulty || "Unknown"
                    )}`}
                  >
                    {problem?.difficulty || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setActiveTab("problem")}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === "problem"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Problem
                </button>
                <button
                  onClick={() => setActiveTab("testcases")}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === "testcases"
                      ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Test Cases
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "problem" && (
                  <div className="p-6">
                    <div className="prose max-w-none prose-slate prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                      {problem?.description ? (
                        <div>
                          {/* Try rendering with ReactMarkdown, fallback to plain text */}
                          <SafeMarkdown content={problem.description} />
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No description available
                        </p>
                      )}

                      {problem?.constraints && (
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-semibold mb-3 text-gray-900">
                            Constraints:
                          </h3>
                          <SafeMarkdown content={problem.constraints} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "testcases" && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900">
                      Sample Test Cases
                    </h3>
                    {problem?.testCases &&
                    Array.isArray(problem.testCases) &&
                    problem.testCases.length > 0 ? (
                      <div className="space-y-4">
                        {problem.testCases
                          .filter((tc) => tc && !tc.isHidden)
                          .map((testCase, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                            >
                              <h4 className="font-semibold mb-4 text-gray-900">
                                Example {index + 1}:
                              </h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Input:
                                  </label>
                                  <pre className="bg-white p-3 rounded-md border border-gray-300 text-sm font-mono text-gray-800 overflow-x-auto">
                                    {testCase?.input || "No input provided"}
                                  </pre>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expected Output:
                                  </label>
                                  <pre className="bg-white p-3 rounded-md border border-gray-300 text-sm font-mono text-gray-800 overflow-x-auto">
                                    {testCase?.expectedOutput ||
                                      "No expected output"}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No test cases available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Code Editor with Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {/* Header with Action Buttons */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between p-6 pb-0">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Code Editor
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm shadow-sm"
                    >
                      {isRunning ? "Running..." : "Run Code"}
                    </button>
                    <button
                      onClick={runTests}
                      disabled={isRunning}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm shadow-sm"
                    >
                      {isRunning ? "Testing..." : "Run Tests"}
                    </button>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-t border-gray-200 mt-4">
                  <button
                    onClick={() => setRightPanelTab("editor")}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                      rightPanelTab === "editor"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 inline mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                    Code Editor
                  </button>
                  <button
                    onClick={() => setRightPanelTab("io")}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
                      rightPanelTab === "io"
                        ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 inline mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Input/Output
                    {testResults.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                        {testResults.filter((r) => r.passed).length}/
                        {testResults.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                <div
                  className={`h-full overflow-auto ${
                    rightPanelTab === "editor" ? "block" : "hidden"
                  }`}
                >
                  <PythonEditor value={code} onChange={setCode} />
                </div>

                {rightPanelTab === "io" && (
                  <div className="h-full overflow-y-auto bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Input:
                        </label>
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          rows="8"
                          placeholder="Enter custom input here..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Output:
                        </label>
                        <div className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm min-h-[200px] font-mono text-gray-800 whitespace-pre-wrap">
                          {customOutput || (
                            <span className="text-gray-400">
                              Output will appear here...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Results */}
                    {testResults.length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Test Results:
                          <span className="ml-2 text-sm text-gray-600">
                            ({testResults.filter((r) => r.passed).length} of{" "}
                            {testResults.length} passed)
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {testResults.map((result, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                result.passed
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-red-50 border-red-200 text-red-800"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium flex items-center">
                                  {result.passed ? (
                                    <svg
                                      className="w-4 h-4 mr-2"
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
                                      className="w-4 h-4 mr-2"
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
                                  Test {index + 1}:{" "}
                                  {result.passed ? "PASSED" : "FAILED"}
                                </span>
                                <span className="text-sm opacity-75">
                                  {result.executionTime}ms
                                </span>
                              </div>
                              {!result.passed && (
                                <div className="mt-3 text-sm space-y-2">
                                  <div className="bg-white bg-opacity-50 p-3 rounded border-l-4 border-emerald-400">
                                    <strong className="text-emerald-700">
                                      Expected:
                                    </strong>
                                    <pre className="mt-1 text-emerald-800 font-mono text-xs">
                                      {result.expected}
                                    </pre>
                                  </div>
                                  <div className="bg-white bg-opacity-50 p-3 rounded border-l-4 border-red-400">
                                    <strong className="text-red-700">
                                      Got:
                                    </strong>
                                    <pre className="mt-1 text-red-800 font-mono text-xs">
                                      {result.actual}
                                    </pre>
                                  </div>
                                  {result.error && (
                                    <div className="bg-white bg-opacity-50 p-3 rounded border-l-4 border-orange-400">
                                      <strong className="text-orange-700">
                                        Error:
                                      </strong>
                                      <pre className="mt-1 text-orange-800 font-mono text-xs">
                                        {result.error}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProblemSolver;

// Updated ProblemSolution.jsx with authentication
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { auth } from "../../Firebase"; // Add this import
import NoLoginError from "../../errors/NoLoginError"; // Add this import
import { css } from "@emotion/react"; // Add this import
import { ScaleLoader } from "react-spinners"; // Add this import
import DisplayQuotes from "../../components/LoadingScreen/DisplayQuotes"; // Add this import

// Add the loading spinner override
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const CodeBlock = ({ node, inline, className, children }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter
      style={tomorrow}
      language={match[1]}
      PreTag="div"
      className="rounded-lg"
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className="px-1.5 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-mono">
      {children}
    </code>
  );
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

function ProblemSolution() {
  const { id } = useParams();

  // Add authentication state
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Existing state variables
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("problem");
  const backend_api = import.meta.env.VITE_BACKEND_API;

  // Add authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        // Only fetch solution if user is authenticated
        if (id) {
          await fetchSolution();
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

  // Modified fetchSolution function
  const fetchSolution = async () => {
    try {
      const res = await fetch(`${backend_api}/api/problems/${id}/solution`);
      if (!res.ok) throw new Error("Solution not found or failed to load.");
      const data = await res.json();
      setSolution(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add loading screen for authentication
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
        <NoLoginError />
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
            <p className="text-gray-600 font-medium">Loading solution...</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                      {solution?.problemId || "N/A"}.{" "}
                      {solution?.title || "Untitled Problem"}
                    </h1>
                    <Link
                      to={`/solve/${id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ← Back to Problem Solver
                    </Link>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                      solution?.difficulty
                    )}`}
                  >
                    {solution?.difficulty || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="flex border-b border-gray-200 bg-gray-50">
                {["problem", "explanation"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-blue-500 text-blue-600 bg-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 prose max-w-none prose-slate prose-headings:text-gray-900 prose-p:text-gray-700 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                {activeTab === "problem" && (
                  <>
                    {solution?.description ? (
                      <ReactMarkdown components={{ code: CodeBlock }}>
                        {solution.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-500">
                        No problem description available.
                      </p>
                    )}
                  </>
                )}
                {activeTab === "explanation" && (
                  <>
                    {solution?.explanation ? (
                      <ReactMarkdown components={{ code: CodeBlock }}>
                        {solution.explanation}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-500">No explanation provided.</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Panel - Final Solution Code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Final Solution
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {solution?.solutionCode ? (
                  <SyntaxHighlighter
                    language="python"
                    style={tomorrow}
                    className="rounded-lg text-sm"
                    PreTag="div"
                  >
                    {solution?.solutionCode}
                  </SyntaxHighlighter>
                ) : (
                  <p className="text-gray-500">No solution code available.</p>
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

export default ProblemSolution;

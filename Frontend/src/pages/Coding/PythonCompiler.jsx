import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import copy from "copy-to-clipboard";
import { ScaleLoader } from "react-spinners";

import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import PythonEditor from "../../components/CodeEditor/PythonEditor";
import NoLoginError from "../../errors/NoLoginError";
import DisplayQuotes from "../../components/LoadingScreen/DisplayQuotes";
import { auth } from "../../Firebase";

// Helper function to extract a cleaner error message
function extractRelevantOutput(rawOutput) {
  if (!rawOutput) return "";
  if (rawOutput.includes("Traceback (most recent call last):")) {
    return rawOutput
      .split("\n")
      .filter((line) => line.trim() !== "")
      .pop();
  }
  return rawOutput.trim();
}

function PythonCompiler() {
  const initialCode =
    "# Welcome to your Python sandbox!\n# Write your code and click 'Run Code' to see the magic.\n\nprint('Hello, professional coder!')";

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backend_api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser || null);
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const submitCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code before submitting.");
      return;
    }
    setIsSubmitting(true);
    setOutput("Running code...");
    try {
      const { data } = await axios.post(`${backend_api}/py`, { code });
      const cleanOutput = extractRelevantOutput(data.passOrFail);
      setOutput(cleanOutput);
    } catch (error) {
      console.error("Error occurred:", error);
      setOutput(
        "Error: Could not connect to the server. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOutputToClipboard = () => {
    if (!output) return;
    copy(output);
    alert("Output copied to clipboard!");
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "output.txt");
  };

  if (isAuthenticating) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900">
        <ScaleLoader color={"#38bdf8"} loading={isAuthenticating} />
        <DisplayQuotes />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <Header />
        <main className="flex-grow">
          <NoLoginError />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Editor Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-100">
              Python Editor
            </h2>
          </div>
          <div className="border border-slate-600 rounded-md">
            <PythonEditor value={code} onChange={handleCodeChange} />
          </div>
          <button
            className="mt-4 inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitCode}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Running..." : "Run Code"}
          </button>
        </div>

        {/* Output Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-100">Output</h3>
            {/* --- ACTION BUTTONS ARE HERE --- */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyOutputToClipboard}
                className="px-4 py-1.5 text-sm font-medium bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors duration-200"
              >
                Copy
              </button>
              <button
                onClick={downloadOutput}
                className="px-4 py-1.5 text-sm font-medium bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 transition-colors duration-200"
              >
                Download
              </button>
            </div>
          </div>
          <pre className="w-full bg-slate-900 text-slate-300 rounded-md p-4 min-h-[120px] whitespace-pre-wrap text-sm font-mono">
            {output || "Your code's output will appear here."}
          </pre>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PythonCompiler;

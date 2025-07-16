import React, { useState, useCallback } from "react";
import PythonEditor from "./Components/CodeEditor/PythonEditor";
import axios from "axios";

function App() {
  const [code, setCode] = useState(
    "# Write Python code here\nprint('Hello from Python!')"
  );
  const [output, setOutput] = useState("");
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const runPythonCode = async () => {
    try {
      const response = await axios.post("http://localhost:3000/py", {
        code: code,
      });
      setOutput(response.data.passOrFail);
    } catch (error) {
      console.error("Error:", error);
      setOutput("Something went wrong while running your code.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "auto" }}>
      <h2>Python Editor</h2>

      <PythonEditor value={code} onChange={handleCodeChange} />

      <button
        onClick={runPythonCode}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Run Code
      </button>

      <h3>Output:</h3>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          backgroundColor: "#f0f0f0",
          padding: "1rem",
          borderRadius: 4,
          minHeight: 100,
        }}
      >
        {output}
      </pre>
    </div>
  );
}

export default App;

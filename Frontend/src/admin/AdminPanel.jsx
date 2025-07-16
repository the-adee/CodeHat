import React, { useState, useEffect } from "react";
import { auth } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import HeadNavBar from "../head-nav-bar";
import FootNavBar from "../foot-nav-bar";

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
  });
  const [preview, setPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(`Problem ${editingId ? "updated" : "added"} successfully!`);
        resetForm();
        fetchProblems(token);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving problem:", error);
      alert("Error saving problem");
    }
  };

  const resetForm = () => {
    setFormData({
      problemId: "",
      title: "",
      description: "",
      difficulty: "Easy",
      solutionLink: "",
    });
    setEditingId(null);
    setPreview(false);
  };

  const handleEdit = (problem) => {
    setFormData({
      problemId: problem.problemId,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      solutionLink: problem.solutionLink,
    });
    setEditingId(problem._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this problem?")) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:3000"
          }/api/problems/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          alert("Problem deleted successfully!");
          fetchProblems(token);
        } else {
          alert("Error deleting problem");
        }
      } catch (error) {
        console.error("Error deleting problem:", error);
        alert("Error deleting problem");
      }
    }
  };

  if (loading) {
    return (
      <>
        <HeadNavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
        <FootNavBar />
      </>
    );
  }

  if (!user || !isAdmin) {
    return (
      <>
        <HeadNavBar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-500">Admin privileges required</p>
          </div>
        </div>
        <FootNavBar />
      </>
    );
  }

  return (
    <>
      <HeadNavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        {/* Add/Edit Problem Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Problem" : "Add New Problem"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Problem ID
                </label>
                <input
                  type="text"
                  value={formData.problemId}
                  onChange={(e) =>
                    setFormData({ ...formData, problemId: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="#34"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Solution Link
              </label>
              <input
                type="text"
                value={formData.solutionLink}
                onChange={(e) =>
                  setFormData({ ...formData, solutionLink: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="/solution/34"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Description (Markdown)
                </label>
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>

              {preview ? (
                <div className="w-full p-4 border rounded-md bg-gray-50 min-h-40 prose max-w-none">
                  <ReactMarkdown>{formData.description}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="10"
                  placeholder="Write problem description in Markdown..."
                  required
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              >
                {editingId ? "Update Problem" : "Add Problem"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold p-6 border-b">
            Existing Problems
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
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
                {problems.map((problem) => (
                  <tr key={problem._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {problem.problemId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {problem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
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
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          problem.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {problem.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(problem)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <FootNavBar />
    </>
  );
}

export default AdminPanel;

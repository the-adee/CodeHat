import { useEffect, useState } from "react";
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import { Link } from "react-router-dom";
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

function PracticePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const backend_api = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchProblems();
      } else {
        setUser(null);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    });

    return () => unsubscribe();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch(`${backend_api}/api/problems`);
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <ScaleLoader
                css={override}
                size={100}
                color={"#123abc"}
                loading={isLoading}
              />
              <DisplayQuotes />
            </div>
          ) : user ? (
            <div className="container mx-auto p-4">
              <div className="overflow-x-auto">
                <div className="py-2">
                  <h1 className="m-3">
                    <span className="text-3xl font-bold">Problem</span>
                  </h1>
                  <table className="w-full table-auto">
                    <thead className="bg-white border-b">
                      <tr>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                          #Problem_ID
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                          Problem Title
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                          Solution Available
                        </th>
                        <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                          Difficulty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.length > 0 ? (
                        problems.map((problem, index) => (
                          <tr
                            key={problem._id}
                            className={
                              index % 2 === 0
                                ? "bg-gray-100 border-b"
                                : "bg-white border-b"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {problem.problemId}
                            </td>
                            <td className="text-base font-normal text-gray-900 px-6 py-4 whitespace-nowrap">
                              <Link
                                to={`/solve/${problem._id}`}
                                className="hover:text-yellow-900"
                              >
                                {problem.title}
                              </Link>
                            </td>
                            <td className="text-base font-normal text-gray-900 px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  problem.solutionLink
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {problem.solutionLink ? "Yes" : "No"}
                              </span>
                            </td>

                            <td className="text-base font-normal text-gray-900 px-6 py-4 whitespace-nowrap">
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No problems available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <NoLoginError />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

export default PracticePage;

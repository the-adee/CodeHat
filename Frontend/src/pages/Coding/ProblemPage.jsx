const ProblemPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-black py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white dark:bg-gray-700 rounded-md shadow-md p-6 sm:p-8 lg:p-10 mx-4 lg:mx-0">
          <div className="text-3xl font-semibold mb-6">Problem</div>
          <div className="text-lg font-semibold leading-relaxed mb-4">
            Problem Statement
          </div>
          <div className="text-base mb-6">
            The task is very simple: given two integers A and B, write a program
            to add these two numbers and output it.
          </div>
          <div className="text-lg font-semibold leading-relaxed mb-4">
            Input Format
          </div>
          <div className="text-base mb-6">
            The first line contains an integer T, the total number of test
            cases. Then follow T lines, each line contains two Integers A and B.
          </div>
          <div className="text-lg font-semibold leading-relaxed mb-4">
            Output Format
          </div>
          <div className="text-base mb-6">
            For each test case, add A and B and display the sum in a new line.
          </div>
          <div className="text-lg font-semibold leading-relaxed mb-4">
            Sample:
          </div>
          {/* // This comment will be retained */}
          <div className="relative w-44 overflow-x-auto shadow-md sm:rounded-lg mt-4">
            <table className="table-fixed text-base text-left w-full">
              <thead className="text-xs">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-white bg-gray-50 dark:bg-gray-700 uppercase"
                  >
                    Input
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-white bg-gray-50 dark:bg-gray-700 uppercase"
                  >
                    Output
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-3">10 20</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td className="px-6 py-3">4 4</td>
                  <td>8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;

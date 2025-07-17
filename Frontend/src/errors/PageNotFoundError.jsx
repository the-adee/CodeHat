import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
import { Link } from "react-router-dom";

function PageNotFoundError() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        {/* Main content container */}
        <div className="flex-grow flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-6xl w-full">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12">
              {/* Text content */}
              <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
                <div className="max-w-md mx-auto lg:mx-0">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                    Oops! Page Not Found
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 mb-6 leading-relaxed">
                    Looks like you've found the doorway to the great nothing.
                    Sorry about that! Please visit our homepage to get where you
                    need to go.
                  </p>
                  <Link to="/" className="inline-block">
                    <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50">
                      Take me home!
                    </button>
                  </Link>
                </div>
              </div>

              {/* Image content */}
              <div className="flex-1 order-1 lg:order-2">
                <div className="relative max-w-lg mx-auto">
                  {/* Main 404 illustration */}
                  <div className="relative">
                    <img
                      src="https://i.ibb.co/G9DC8S0/404-2.png"
                      alt="404 Error Illustration"
                      className="w-full h-auto drop-shadow-lg"
                    />
                  </div>

                  {/* Decorative element */}
                  <div className="absolute -top-4 -right-4 lg:-top-8 lg:-right-8 opacity-50 animate-pulse">
                    <img
                      src="https://i.ibb.co/ck1SGFJ/Group.png"
                      alt="Decorative element"
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PageNotFoundError;

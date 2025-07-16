import { useState } from "react";

const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative">
      <div className="w-full overflow-hidden">
        <div className="flex items-center">
          <button
            type="button"
            onClick={prevImage}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 inline-flex items-center ml-2 md:ml-4 md:mr-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            style={{
              backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
              color: "#fff",
            }}
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>
          <div className="flex-auto">
            <img
              src={images[currentImageIndex]}
              alt={`Image ${currentImageIndex}`}
              className="w-full"
              style={{ height: "auto" }}
            />
          </div>
          <button
            type="button"
            onClick={nextImage}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 inline-flex items-center ml-2 md:ml-4 md:mr-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            style={{
              backgroundImage: "linear-gradient(to right, #38a3a5, #57cc99)",
              color: "#fff",
            }}
          >
            Next
            <svg
              className="w-5 h-5 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;

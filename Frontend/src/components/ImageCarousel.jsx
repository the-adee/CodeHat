import { useEffect, useState, useRef } from "react";

const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToImage = (index) => setCurrentImageIndex(index);

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    else if (diff < -50) prevImage();
  };

  return (
    <div
      className="relative w-full h-64 sm:h-80 md:h-[28rem] lg:h-[32rem] rounded-xl overflow-hidden shadow-xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[currentImageIndex]}
        alt={`Slide ${currentImageIndex}`}
        className="w-full h-full object-cover transition-all duration-500"
      />

      {/* Prev Button */}
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:scale-105 transition"
      >
        <svg
          className="w-5 h-5"
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
      </button>

      {/* Next Button */}
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:scale-105 transition"
      >
        <svg
          className="w-5 h-5"
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

      {/* Dots */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentImageIndex ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;

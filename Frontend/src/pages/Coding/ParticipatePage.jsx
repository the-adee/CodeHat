import Header from "../../../components/Navigation/Header";
import Footer from "../../../components/Navigation/Footer";
import ImageCarousel from "./imagecarousel";

const ParticipatePage = () => {
  const images = [
    "https://wallpapercave.com/wp/wp12286879.png",
    "https://wallpapercave.com/wp/wp12286881.png",
    "https://wallpapercave.com/wp/wp12286903.png",
    // Add more image URLs as needed
  ];

  return (
    <>
      <Header />
      <div className="App">
        <ImageCarousel images={images} />
      </div>
      <Footer />
    </>
  );
};

export default ParticipatePage;

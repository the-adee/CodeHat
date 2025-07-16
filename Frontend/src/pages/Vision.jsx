import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";

function Vision() {
  return (
    <>
      <Header />
      <div
        className="bg-auto bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('https://wallpapercave.com/wp/wp12022824.png')",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold mb-5">Our Vision</h1>
          <p className="text-blue-800 mb-8 font-serif">
            At CodeHat, our vision is to empower coders of all levels to develop
            their skills and pursue their passions.
          </p>
          <p className="text-blue-800 mb-8 font-serif">
            Our platform offers a range of resources and tools to help beginners
            get started, and to support more experienced coders in their ongoing
            learning and growth.
          </p>
          <p className="text-blue-800 mb-8 font-serif">
            We believe that coding is not just a skill, but a way of thinking
            and problem-solving that can help people succeed in any field. Our
            goal is to make coding accessible and enjoyable for everyone, and to
            create a community where coders can connect, collaborate, and learn
            from each other.
          </p>
          <p className="text-blue-800 mb-10 font-serif">
            Thank you for being a part of our community! 😊
          </p>
          <p className="text-gray-800 text-lg font-mono">Aditya Gupta</p>
          <p className="text-gray-800 text-md">
            <i>Founder 👨‍💻</i>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Vision;

import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import ImageCarousel from "../../components/ImageCarousel";

// Importing images from assets
import codingContestImg from "../../assets/coding_contests.png";
import teamWorkImg from "../../assets/teamwork.png";
import comingSoonImg from "../../assets/coming_soon.png";
// You can add more local images here if needed

const ParticipatePage = () => {
  const images = [codingContestImg, teamWorkImg, comingSoonImg];

  return (
    <>
      <Header />

      <main className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-20 py-10">
        <section className="max-w-7xl mx-auto text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
            Participate & Showcase Your Skills
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
            Join exciting challenges, compete with peers, and get recognized.
            Discover opportunities designed to help you grow!
          </p>
        </section>

        <section className="max-w-5xl mx-auto mb-16">
          <ImageCarousel images={images} />
        </section>

        <section className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Stay tuned for upcoming coding events and project collaborations.
            You can participate as an individual or form a team.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-200"
            title="Work in Progress..."
          >
            Explore Events
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ParticipatePage;

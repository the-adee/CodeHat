import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";

const Vision = () => {
  return (
    <>
      <Header />
      <main className="bg-white min-h-screen py-16 px-6 font-inter text-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Vision</h1>
          <h2 className="text-gray-500 font-medium text-base mb-10">
            The story behind CodeHat
          </h2>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            Let me tell you the story of <strong>CodeHat</strong> — a platform I
            built from scratch, inspired by an idea I couldn't let go of.
          </p>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            It all began in my first year of college, back in 2022. A small
            conversation sparked a big thought: what if there was a coding
            platform that didn’t care about ranks, leaderboards, or popularity —
            just clean, anonymous problem-solving? Level-based. Fair. No
            pressure.
          </p>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            At the time, I discussed it with a few friends. We were all excited
            by the concept. But as time passed, everyone got busy — except me.
            The idea stayed with me, and honestly, it never left.
          </p>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            I didn’t want it to just be a "what if." So, I started building.
            Late nights, lots of trial and error. Piece by piece, CodeHat
            started taking shape.
          </p>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            This platform isn’t backed by a team or a company. There’s no
            funding, no PR. Just one person who believed in the idea and
            followed through — with code, patience, and love for clean
            problem-solving.
          </p>

          <p className="text-[0.95rem] leading-relaxed mb-6">
            CodeHat is still evolving. And I'm just getting started.
          </p>

          <p className="text-[0.95rem] leading-relaxed mt-10 italic">
            Thanks for reading my story. <br />I hope you find something
            valuable here.
          </p>

          <p className="text-sm text-gray-500 mt-8">
            — <span className="italic">Aditya Gupta</span>,{" "}
            <span className="not-italic">Mar 17, 2023</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Vision;

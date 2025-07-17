import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <Header />
      <main className="bg-white min-h-screen py-16 px-6 font-inter text-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <h2 className="text-gray-500 font-medium text-base mb-8 italic">
            Effective as of July 2025
          </h2>

          <p className="text-[0.95rem] leading-relaxed mb-4">
            By accessing or using <span className="font-semibold">CodeHat</span>
            , you agree to be bound by these Terms of Service. Please read them
            carefully.
          </p>

          <hr className="my-5 border-gray-400" />

          <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            By creating an account or using any part of the CodeHat platform,
            you acknowledge that you have read, understood, and agree to comply
            with these Terms.
          </p>

          <h3 className="text-lg font-semibold mb-2">
            2. User Responsibilities
          </h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            You agree to use the platform respectfully, without engaging in
            activities such as spamming, harassment, or intellectual property
            violations.
          </p>

          <h3 className="text-lg font-semibold mb-2">3. Content Ownership</h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            You retain ownership of the content you create, but by posting on
            CodeHat, you grant us a non-exclusive license to display, modify, or
            distribute your content as part of our platform services.
          </p>

          <h3 className="text-lg font-semibold mb-2">4. Modifications</h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            We may update these Terms from time to time. Changes will be posted
            on this page, and your continued use of CodeHat implies acceptance
            of the updated terms.
          </p>

          <h3 className="text-lg font-semibold mb-2">5. Termination</h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            We reserve the right to suspend or terminate your account if you
            violate these Terms or engage in harmful behavior on the platform.
          </p>

          <h3 className="text-lg font-semibold mb-2">6. Contact Us</h3>
          <p className="text-[0.95rem] leading-relaxed mb-5">
            If you have any questions or concerns about these Terms, please
            contact us at{" "}
            <span className="italic">
              <a href="mailto:hapticfeedbak@proton.me">
                hapticfeedbak@proton.me
              </a>
            </span>
            .
          </p>

          <p className="text-sm text-gray-500 mt-10 italic">
            Last updated: July 2025
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsAndConditions;

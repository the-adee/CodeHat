import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";

const TermsConditions = () => {
  return (
    <>
      <Header />
      <div
        style={{
          backgroundImage: "url('https://wallpapercave.com/wp/wp6591366.jpg')",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-10">
            Terms &amp; Conditions
          </h1>
          <div className="prose prose-lg">
            <p>
              Welcome to CodeHat! Please read these Terms &amp; Conditions
              carefully before using our web-based coding platform. By using our
              platform, you agree to these terms and conditions in full. If you
              do not agree with any part of these terms, you should not use our
              platform.
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 mt-8 mb-4">
              1. Scope of Agreement
            </h2>
            <p>
              CodeHat is a web-based platform that provides a range of coding
              tools, resources, and services to users. This agreement sets forth
              the terms and conditions governing your use of the CodeHat
              platform.
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 mt-8 mb-4">
              2. Account Registration and Security
            </h2>
            <p>
              To use our platform, you must create an account by providing
              accurate and complete information. You must also maintain the
              confidentiality of your account information and are responsible
              for all activities that occur under your account. You agree to
              immediately notify us of any unauthorized use of your account.
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 mt-8 mb-4">
              3. Use of the Platform
            </h2>
            <p>
              CodeHat grants you a non-exclusive, non-transferable, revocable
              license to access and use our platform solely for your personal or
              internal business purposes. You agree to use our platform only for
              lawful purposes and in a manner consistent with all applicable
              laws and regulations. You agree not to engage in any conduct that
              could damage, disable, or impair the functionality or security of
              our platform.
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 mt-8 mb-4">
              4. Content Ownership and Use
            </h2>
            <p>
              You retain all ownership rights in any content that you upload,
              post, or transmit to our platform. By posting content, you grant
              CodeHat a non-exclusive, royalty-free, worldwide, perpetual, and
              irrevocable license to use, reproduce, modify, adapt, publish,
              translate, distribute, and display such content in connection with
              our platform.
            </p>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 mt-8 mb-4">
              5. Intellectual Property
            </h2>
            <p>
              The CodeHat platform and all content and materials included on our
              platform, including but not limited to text, graphics, logos,
              images, and software, are the property
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsConditions;

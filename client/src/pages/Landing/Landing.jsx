import { Link } from "react-router-dom";
import LandingFooter from "../../components/Landing/LandingFooter";

function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: Hero Graphic */}
        <div className="flex-1 relative flex items-center justify-center bg-blue-500 overflow-hidden min-h-[40vh] lg:min-h-full">
          {/* Using the generated hero image */}
          <img 
            src="/hero.png" 
            alt="Chatter connection graphic" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          {/* Overlay chatter logo */}
          <h1 className="z-10 text-white text-6xl md:text-8xl font-black tracking-tighter drop-shadow-2xl flex items-center gap-4">
            <span className="text-blue-200">#</span>Chatter
          </h1>
        </div>

        {/* Right Side: CTA Section */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-md w-full flex flex-col gap-12">
            
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
              Happening now
            </h2>

            <div className="flex flex-col gap-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Join today.
              </h3>
              
              <Link 
                to="/register"
                className="w-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg py-3 rounded-full hover:bg-blue-600 transition-colors shadow-md"
              >
                Create account
              </Link>
              
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                <span className="text-gray-500 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-lg">Already have an account?</h4>
                <Link 
                  to="/login"
                  className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 text-blue-500 font-bold text-lg py-3 rounded-full hover:bg-blue-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

export default Landing;

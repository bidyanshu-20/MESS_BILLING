import { Link } from "react-router-dom";
import RuleBasedChatbot from "../components/RuleBasedChatbot";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Optional subtle background animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -left-20 -top-20 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -right-20 bottom-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center w-full max-w-5xl">
        <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-extrabold mb-5 sm:mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-white">
            Mess Billing System
          </span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-orange-100/90 max-w-xl mx-auto mb-10 sm:mb-12 font-light leading-relaxed">
          Simple. Clean. Powerful.<br className="sm:hidden" />
          Manage mess bills the modern way
        </p>

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-center">
          <Link to="/login" className="w-full sm:w-auto max-w-xs">
            <button className="group relative px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-orange-900 font-bold rounded-xl text-base sm:text-lg shadow-2xl hover:shadow-orange-500/40 transform hover:-translate-y-1.5 transition-all duration-300 overflow-hidden w-full">
              <span className="relative z-10">Login to Your Account</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </button>
          </Link>

          {/* Uncomment when you need admin login */}
          {/*
          <Link to="/admin-login" className="w-full sm:w-auto max-w-xs">
            <button className="px-8 sm:px-10 py-3.5 sm:py-4 bg-transparent border-2 border-white/60 text-white font-bold rounded-xl text-base sm:text-lg hover:bg-white/10 hover:border-white transition-all duration-300 w-full">
              Admin Login
            </button>
          </Link>
          */}
        </div>

        {/* Feature Cards */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-2 sm:px-0">
          {[
            { icon: "🔒", text: "Secure Login", color: "from-blue-500" },
            { icon: "📊", text: "Monthly Bills", color: "from-amber-500" },
            { icon: "👑", text: "Admin Control", color: "from-purple-600" },
          ].map((item, i) => (
            <div
              key={i}
              className={`group bg-gradient-to-br ${item.color} to-slate-900/40 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-white/30 hover:scale-[1.03] sm:hover:scale-[1.04] transition-all duration-300 hover:shadow-2xl`}
            >
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold">{item.text}</h3>
            </div>
          ))}
        </div>
      </div>
      <RuleBasedChatbot />
    </div>
  );
};

export default Home;
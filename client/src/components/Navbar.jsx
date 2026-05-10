
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll → shrink + stronger glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-slate-950/60 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/30"
          : "py-5 bg-slate-900/30 backdrop-blur-lg border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 group relative">
          <div
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-orange-300 to-red-300 
            group-hover:from-white group-hover:via-amber-100 group-hover:to-white transition-all duration-700 ${
              scrolled ? "scale-95" : "scale-100"
            }`}
          >
            Mess Billing
          </div>
          {/* Optional subtle glow blob behind logo */}
          <div className="absolute -inset-4 opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-2xl bg-gradient-to-r from-amber-400/30 via-orange-500/20 to-red-500/30 rounded-full -z-10"></div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-6">
          <Link
            to="/"
            className={`relative px-4 py-2.5 text-white/90 font-medium rounded-lg transition-all duration-400 group ${
              isActive("/") ? "text-white" : "hover:text-white"
            }`}
          >
            <span className="relative z-10">Home</span>
            <span
              className={`absolute bottom-1.5 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full origin-left transition-transform duration-400 ${
                isActive("/") || "scale-x-0 group-hover:scale-x-100"
              }`}
            ></span>
          </Link>

          <Link
            to="/login"
            className={`relative px-7 py-3 font-semibold rounded-xl shadow-lg transition-all duration-400 transform hover:-translate-y-1 active:scale-95 overflow-hidden ${
              isActive("/login")
                ? "bg-gradient-to-r from-amber-600 to-orange-700 shadow-orange-700/40 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 hover:shadow-orange-700/50"
            }`}
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-white/15 scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-500"></div>
          </Link>

          {/* Uncomment if you want Sign Up back */}
          {/* <Link to="/signup" className="px-7 py-3 border-2 border-amber-400/50 text-amber-200 font-semibold rounded-xl hover:bg-amber-500/10 hover:border-amber-300 hover:text-white transition-all duration-300">
            Sign Up
          </Link> */}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className={`w-9 h-9 transition-all duration-500 transform ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-gradient-to-br from-slate-950/95 to-black/95 backdrop-blur-xl transition-all duration-500 ease-in-out z-40 flex flex-col items-center justify-center gap-10 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className={`text-4xl font-bold text-white/90 transition-all duration-400 hover:text-white hover:scale-110 ${
            isActive("/") ? "text-amber-300" : ""
          }`}
        >
          Home
        </Link>

        <Link
          to="/login"
          onClick={() => setIsOpen(false)}
          className={`text-4xl font-bold px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-2xl hover:shadow-orange-700/50 hover:scale-105 transition-all duration-400`}
        >
          Login
        </Link>

        {/* <Link to="/signup" onClick={() => setIsOpen(false)} className="text-4xl font-bold text-amber-200 hover:text-white transition-all">
          Sign Up
        </Link> */}
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { toast } from "react-toastify";




const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // console.log("--signIN--")
  // const API_BASE = import.meta.env.VITE_BACKEND_URL;
  // console.log("->", API_BASE);
  // console.log("--------");





  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.warning("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        toast.error("Login failed");
        return;
      }

      setLoading(false);
      setError(null);

      toast.success("Login successful 🎉");
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));



      const role = data.user.role.toLowerCase();
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "user") {
        navigate(`/user/dashboard/${data.user.rollno}`);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 -top-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -right-20 bottom-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-8 md:p-10 transition-all duration-300 hover:shadow-purple-900/30">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-400 mt-2 text-lg">
              Sign in to manage your mess billing
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                required
              />
            </div>

            {/* Password + Forgot link */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-slate-300 font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                required
              />

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate('/reset/password')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-300 ${loading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98]"
                } text-white flex items-center justify-center gap-3`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-slate-400 mt-8 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>

          {/* Optional subtle error display */}
          {error && (
            <p className="text-red-400 text-center mt-4 text-sm font-medium">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
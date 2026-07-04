import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

   const API_BASE = import.meta.env.VITE_BACKEND_URL;
  console.log("ForgotPassword->", API_BASE);




  const sendOtp = async () => {
    if (!email) {
      toast.warning("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.warning("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified");
        setStep(3);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully 🎉");
        navigate("/login"); // or "/" — your choice
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow blobs — same as Login */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-20 -top-40 w-96 h-96 md:w-[500px] md:h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -right-20 bottom-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-8 md:p-10 transition-all duration-300 hover:shadow-purple-900/30">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 tracking-tight">
              Reset Password
            </h2>
            <p className="text-slate-400 mt-2 text-lg">
              {step === 1 && "Enter your email to receive OTP"}
              {step === 2 && "Enter the 6-digit OTP sent to your email"}
              {step === 3 && "Choose a strong new password"}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Step 1 - Email */}
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                  />
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className={`w-full py-3.5 px-6 font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-300 ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98]"
                  } text-white flex items-center justify-center gap-3`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </>
            )}

            {/* Step 2 - OTP */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="otp" className="block text-slate-300 font-medium mb-2">
                    OTP (6 digits)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="______"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300 text-center text-xl tracking-[0.5em]"
                  />
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className={`w-full py-3.5 px-6 font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-300 ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98]"
                  } text-white flex items-center justify-center gap-3`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            {/* Step 3 - New Password */}
            {step === 3 && (
              <>
                <div>
                  <label htmlFor="newPassword" className="block text-slate-300 font-medium mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300"
                  />
                </div>

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className={`w-full py-3.5 px-6 font-semibold text-lg rounded-xl shadow-lg transform transition-all duration-300 ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-orange-500/40 hover:-translate-y-1 active:scale-[0.98]"
                  } text-white flex items-center justify-center gap-3`}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}

            {/* Navigation / Back */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => (step === 1 ? navigate("/login") : setStep(step - 1))}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors hover:underline"
              >
                {step === 1 ? "← Back to Sign In" : "← Previous Step"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
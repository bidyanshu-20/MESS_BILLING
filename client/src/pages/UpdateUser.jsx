// pages/UpdateUser.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UpdateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollno: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // console.log("--UpDateUser--")
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  console.log("UpDateUser->", API_BASE);
  // console.log("--------");






  // Fetch logged-in user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/user/messbill", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            rollno: data.user.rollno || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load your profile. Please try again.", {
          position: "bottom-right",
          autoClose: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated successfully! 🎉", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
        });

        // Small delay so user can see the success toast
        setTimeout(() => {
          navigate(`/user/dashboard/${formData.rollno}`);
        }, 1500);
      } else {
        toast.error(data.message || "Failed to update profile", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again later.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Card with glass effect */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/70 px-8 py-6 border-b border-slate-700/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Edit Profile
            </h2>
            <p className="mt-2 text-slate-200 text-sm sm:text-base">
              Update your personal information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-indigo-400/70"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-indigo-400/70"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Roll Number */}
            <div>
              <label
                htmlFor="rollno"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Roll Number
              </label>
              <input
                id="rollno"
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 hover:border-indigo-400/70 font-mono"
                placeholder="Your roll number"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Usually cannot be changed — contact admin if needed
              </p>
            </div>

            {/* Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className={`
                  flex-1 py-3 px-6 rounded-lg font-medium text-white
                  transition-all duration-200 flex items-center justify-center gap-2 shadow-lg
                  ${submitting
                    ? "bg-indigo-600/50 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] shadow-indigo-900/30 hover:shadow-indigo-700/50"
                  }
                `}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => navigate(`/user/dashboard/${formData.rollno}`)}
                className="flex-1 py-3 px-6 rounded-lg font-medium bg-slate-700/70 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          All changes are saved securely and reflected immediately
        </p>
      </div>

    </div>
  );
}

export default UpdateUser;
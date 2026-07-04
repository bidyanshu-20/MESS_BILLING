import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";



const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const navigate = useNavigate();
  console.log("--signUP--")
 const API_BASE = import.meta.env.VITE_BACKEND_URL;
 console.log("->",API_BASE);
 console.log("--------");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.rollno ) {
      toast.warning("Please fill all fields");
      return;
    }
    try {
      // console.log(formData);
      setLoading(true);
      // console.log("Data is submitted");
      const res = await fetch("/api/auth/signup", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      // console.log(formData);
      if (data.success === false) {

        setLoading(false);
        setError(data.message);
        toast.error(data.message || "Signup failed");

        return;
      }
      setLoading(false);
      setError(null);
      toast.success("Account created successfully 🎉");

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
    catch (error) {
      setLoading(false);
      setError(error.message);
      toast.error("Something went wrong!");
    }

  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Name</label>
            <input
              id="name"
              type="text"
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Roll No.</label>
            <input
              id="rollno"
              type="text"
              onChange={handleChange}
              placeholder="Enter Your Rollno."
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="block text-gray-300 mb-1">Role (Admin/User)</label>
            <select
              id="role"
              value={formData.role || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Your Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div> */}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? 'Loading....' : 'Sign Up'}
          </button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an Account..{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-500 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default SignUp;

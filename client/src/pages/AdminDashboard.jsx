

// export default AdminDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../components/Search";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  console.log("AdminDashboard->", API_BASE);



  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const filteredUsers = users.filter((user) =>
    user.rollno?.toString().toLowerCase().includes(search.toLowerCase())
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    window.location.href = "/";
  };

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/auth/admin/delete/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert("User deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/70 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">

          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Admin Dashboard
          </h1>

          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">
              Manage Students
            </h2>
            <p className="text-slate-400 text-sm">
              {users.length} Registered Users
            </p>
          </div>

          <div className="w-full md:w-72">
            <Search search={search} onSearchChange={(e) => setSearch(e.target.value)} />
          </div>

        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">

          {/* TABLE HEADER */}
          <div className="hidden sm:grid grid-cols-3 bg-slate-800 text-sm font-semibold px-4 py-3">
            <div>Roll No</div>
            <div>Name</div>
            <div className="text-right">Actions</div>
          </div>

          {/* USERS */}
          <div className="max-h-[70vh] overflow-y-auto">

            {filteredUsers.length === 0 ? (
              <p className="text-center py-10 text-slate-400">
                No Students Found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 px-4 py-4 border-b border-slate-800 hover:bg-slate-800/50 transition"
                >

                  {/* Roll */}
                  <div className="text-sm sm:text-base font-mono">
                    <span className="sm:hidden font-semibold">Roll: </span>
                    {user.rollno}
                  </div>

                  {/* Name */}
                  <div className="text-sm sm:text-base">
                    <span className="sm:hidden font-semibold">Name: </span>
                    {user.name}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap sm:justify-end gap-2 mt-2 sm:mt-0">
                    {/* /admin/user/${user.rollno} */}
                    <button
                      onClick={() => navigate(`/admin/user-details/${user.rollno}`)}
                      className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                    >
                      Create Bill
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 rounded-lg"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
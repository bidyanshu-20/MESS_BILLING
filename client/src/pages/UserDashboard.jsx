
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { io } from "socket.io-client";
import { useRef } from "react";

const UserDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userdata, setUserdata] = useState(null);
  const [userId, setUserId] = useState(null);
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, "0"));

  useEffect(() => {
    const monthsForYear = bills
      .filter((bill) => bill.month.startsWith(selectedYear))
      .map((bill) => bill.month.split("-")[1]);

    if (monthsForYear.length > 0) {
      setSelectedMonth(monthsForYear[0]);
    }
  }, [selectedYear, bills]);

  const navigate = useNavigate();
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3400");

    return () => {
      socket.current.disconnect();
    };
  }, []);


  // useEffect(() => {
  const fetchBills = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/messbill", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.bills)) {
        setBills(data.bills);
        setUserdata(data.user);
        // console.log(data);
        // console.log("->",  data.bills[0].user._id);
        // console.log(":->",data.bills[0]?.user?._id)
        // const user_id = data.bills[0].user._id;
        if (data.bills[0]?.user?._id) {
          setUserId(data.bills[0]?.user?._id);
        }
        // console.log("----->",data.user);
      } else {
        setBills([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load mess bills");
    } finally {
      setLoading(false);
    }
  };

  // fetchBills();
  // }, []);
  useEffect(() => {
    fetchBills();
  }, []);

  // useEffect(async () => {
  //   // console.log("=====>", data.user)
  //   // console.log("---->", bills);
  //   const bills = await bills.find()
  //     .populate("user");
  //     console.log(bills)
  // })


  // useEffect(() => {
  //    if (!userId || !socket.current) return;
  //   socket.emit("joinRoom", userId);
  //   console.log("---->", userId);
  //   socket.on("newBillAdded", (bill) => {
  //     setBills((prev) => [...prev, bill]);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [userId]);

  useEffect(() => {
    if (!userId || !socket.current) return;

    socket.current.emit("joinRoom", userId);
    console.log("Joined room:", userId);

    socket.current.on("new-bill", () => {
      console.log("New bill received!");
      fetchBills();   // 🔥 realtime refresh
    });

    return () => {
      socket.current.off("new-bill");
    };

  }, [userId]);


  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleDownloadPdf = (billId) => {
    const bill = bills.find((b) => b._id === billId);
    if (!bill) {
      alert("Bill not found");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header ─────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);

    const monthYear = new Date(`${bill.month}-01`)
      .toLocaleDateString("en-US", { month: "long", year: "numeric" });

    doc.text(`Mess Bill - ${monthYear}`, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80);

    doc.text(
      `Student: ${userdata?.name || "-"}  |  Roll No: ${userdata?.rollno || "-"}`,
      14,
      30
    );
    doc.text(`Email: ${userdata?.email || "-"}`, 14, 36);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(34, 197, 94);
    doc.text(
      `Total: Rs. ${bill.totalAmount}`,
      pageWidth - 14,
      28,
      { align: "right" }
    );

    // ── Table ─────────────────────────────────────
    const tableColumn = ["Date", "Breakfast", "Lunch", "Dinner", "Extras", "Total"];

    const tableRows = bill.days.map((day) => [
      new Date(day.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      day.breakfast ? `Rs. ${day.breakfast}` : "-",
      day.lunch ? `Rs. ${day.lunch}` : "-",
      day.dinner ? `Rs. ${day.dinner}` : "-",
      day.extras ? `Rs. ${day.extras}` : "-",
      day.total ? `Rs. ${day.total}` : "-",
    ]);

    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "center",
      },

      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },

      columnStyles: {
        0: { cellWidth: 25 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right", fontStyle: "bold" },
      },

      margin: { left: 14, right: 14 },
      tableWidth: "auto",
    });

    // ── Grand Total ───────────────────────────────
    const finalY = doc.lastAutoTable?.finalY || 50;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);

    doc.text(
      `Grand Total: Rs. ${bill.totalAmount}`,
      pageWidth - 14,
      finalY + 10,
      { align: "right" }
    );

    // ── Save ──────────────────────────────────────
    const fileName = `Mess_Bill_${userdata?.rollno || "user"}_${bill.month}.pdf`;
    doc.save(fileName);
  };



  const years = [...new Set(bills.map((bill) => bill.month.split("-")[0]))];

  const filteredBill = bills.find((bill) => {
    const [year, month] = bill.month.split("-");
    return year === selectedYear && month === selectedMonth;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading your bills...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 flex items-center justify-center text-red-400 text-xl">
        {error}
      </div>
    );
  }

  const Updateuser = () => {
    navigate("/edit-profile")
    // console.log("I am update component");
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Header / Top Bar */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/60 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mess <span className="text-amber-400">Dashboard</span>
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-300">
              Welcome back, <span className="text-amber-300 font-medium">{userdata?.name}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-600/90 hover:bg-red-700 px-5 py-2 rounded-lg font-medium transition-all hover:shadow-red-700/30 shadow-lg shadow-red-900/20"
            >
              Sign Out
            </button>
            <button
              onClick={Updateuser}
              className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-medium transition-all hover:shadow-white-700/30 shadow-lg shadow-red-900/20"
            >
              Update
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
          {/* Left column - User Info + Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-black/30">
              <h2 className="text-xl font-semibold mb-5 pb-3 border-b border-slate-600/70 flex items-center gap-3">
                <span className="text-2xl">👤</span> Profile
              </h2>
              <div className="space-y-3 text-sm">
                <p><span className="text-slate-400">Name:</span> <strong>{userdata?.name}</strong></p>
                <p><span className="text-slate-400">Roll No:</span> <strong>{userdata?.rollno}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong className="break-all">{userdata?.email}</strong></p>
              </div>
            </div>

            {/* Filters Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-black/30">
              <h3 className="text-lg font-semibold mb-5 pb-3 border-b border-slate-600/70">
                Filter Bill
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {years.length === 0 ? (
                      <option value={selectedYear}>{selectedYear}</option>
                    ) : (
                      years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, i) => (
                      <option key={m} value={m}>
                        {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Bill Display */}
          <div className="lg:col-span-3">
            {!filteredBill ? (
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-10 text-center text-slate-400 text-lg">
                No mess bill found for {new Date(`${selectedYear}-${selectedMonth}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
                {/* Bill Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">
                    {new Date(`${filteredBill.month}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h2>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-slate-300">Total Amount</div>
                      <div className="text-2xl font-bold text-green-400">₹{filteredBill.totalAmount}</div>
                    </div>

                    <button
                      onClick={() => handleDownloadPdf(filteredBill._id)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-medium shadow-lg shadow-blue-900/30 transition-all hover:shadow-blue-700/40 hover:-translate-y-0.5"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/80">
                      <tr>
                        <th className="p-4 text-left font-semibold">Date</th>
                        <th className="p-4 text-center font-semibold">Breakfast</th>
                        <th className="p-4 text-center font-semibold">Lunch</th>
                        <th className="p-4 text-center font-semibold">Dinner</th>
                        <th className="p-4 text-center font-semibold">Extras</th>
                        <th className="p-4 text-center font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {filteredBill.days.map((day, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-700/40 transition-colors"
                        >
                          <td className="p-4">
                            {new Date(day.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td className="p-4 text-center">₹{day.breakfast || 0}</td>
                          <td className="p-4 text-center">₹{day.lunch || 0}</td>
                          <td className="p-4 text-center">₹{day.dinner || 0}</td>
                          <td className="p-4 text-center">₹{day.extras || 0}</td>
                          <td className="p-4 text-center font-semibold text-green-400">
                            ₹{day.total || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
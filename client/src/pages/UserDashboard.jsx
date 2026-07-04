import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { io } from "socket.io-client";
import { useRef } from "react";

const UserDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userdata, setUserdata] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userDetails,setUserDetails] = useState(null);
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString()
  );
  
  // / console.log("--signIN--")
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  console.log("UserDashboard ->", API_BASE);
  console.log("--------"); 


  const [selectedMonth, setSelectedMonth] = useState(
    (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")
  );

  const navigate = useNavigate();

  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3400");

    return () => {
      socket.current.disconnect();
    };
  }, []);

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

      // console.log(data);

      if (data.success && Array.isArray(data.bills)) {
        setBills(data.bills);
        
        // console.log("---->",data)
        setUserdata(data.user);

        if (data.bills[0]?.user?._id) {
          setUserId(data.bills[0]?.user?._id);
          // console.log("--ID ---> ",data.bills[0]?.user);
          setUserDetails(data.bills[0]?.user);
        }
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

  useEffect(() => {
    fetchBills();
  }, []);


  useEffect(() => {
    if (!userId || !socket.current) return;

    socket.current.emit("joinRoom", userId);

    console.log("Joined room:", userId);

    socket.current.on("new-bill", () => {
      console.log("New bill received!");

      fetchBills();
    });

    return () => {
      socket.current.off("new-bill");
    };
  }, [userId]);


  useEffect(() => {
    const monthsForYear = bills
      .filter((bill) =>
        bill.month.startsWith(selectedYear)
      )
      .map((bill) => bill.month.split("-")[1]);

    if (monthsForYear.length > 0) {
      setSelectedMonth(monthsForYear[0]);
    }
  }, [selectedYear, bills]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };


  const Updateuser = () => {
    navigate("/edit-profile");
  };
  

  // useEffect(()=>{
  //   console.log("-->");
  //   console.log(userDetails);
  // })

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

    const pageWidth =
      doc.internal.pageSize.getWidth();

    // HEADER

    doc.setFont("helvetica", "bold");

    doc.setFontSize(18);

    doc.setTextColor(30, 58, 138);

    const monthYear = new Date(
      `${bill.month}-01`
    ).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    doc.text(
      `Mess Bill - ${monthYear}`,
      14,
      20
    );

    doc.setFont("helvetica", "normal");

    doc.setFontSize(11);

    doc.setTextColor(80);

    doc.text(
      `Student: ${userdata?.name || "-"}  |  Roll No: ${userdata?.rollno || "-"
      }`,
      14,
      30
    );

    doc.text(
      `Email: ${userdata?.email || "-"}`,
      14,
      36
    );

    doc.setFont("helvetica", "bold");

    doc.setFontSize(13);

    doc.setTextColor(34, 197, 94);

    doc.text(
      `Total: Rs. ${bill.totalAmount}`,
      pageWidth - 14,
      28,
      { align: "right" }
    );

    // TABLE

    const tableColumn = [
      "Date",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Extras",
      "Total",
    ];

    const tableRows = bill.days.map((day) => [
      new Date(day.date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      ),

      day.breakfast
        ? `Rs. ${day.breakfast}`
        : "-",

      day.lunch ? `Rs. ${day.lunch}` : "-",

      day.dinner
        ? `Rs. ${day.dinner}`
        : "-",

      day.extras
        ? `Rs. ${day.extras}`
        : "-",

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
        5: {
          halign: "right",
          fontStyle: "bold",
        },
      },

      margin: { left: 14, right: 14 },

      tableWidth: "auto",
    });

    // GRAND TOTAL

    const finalY =
      doc.lastAutoTable?.finalY || 50;

    doc.setFont("helvetica", "bold");

    doc.setFontSize(12);

    doc.setTextColor(34, 197, 94);

    doc.text(
      `Grand Total: Rs. ${bill.totalAmount}`,
      pageWidth - 14,
      finalY + 10,
      { align: "right" }
    );

    // SAVE

    const fileName = `Mess_Bill_${userdata?.rollno || "user"
      }_${bill.month}.pdf`;

    doc.save(fileName);
  };


  const years = [
    ...new Set(
      bills.map((bill) => bill.month.split("-")[0])
    ),
  ];

  const filteredBill = bills.find((bill) => {
    const [year, month] =
      bill.month.split("-");

    return (
      year === selectedYear &&
      month === selectedMonth
    );
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <svg
            className="animate-spin h-6 w-6"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">


      <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/60 border-b border-slate-700/50">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mess{" "}
            <span className="text-amber-400">
              Dashboard
            </span>
          </h1>

          <div className="flex items-center gap-4">

            <div className="text-sm text-slate-300">
              Welcome back,{" "}
              <span className="text-amber-300 font-medium">
                {userdata?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="bg-red-600/90 hover:bg-red-700 px-5 py-2 rounded-lg font-medium"
            >
              Sign Out
            </button>

            <button
              onClick={Updateuser}
              className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg font-medium"
            >
              Update
            </button>

            {/* // , { state: { user: userdata }, } */}
            <button
              onClick={() => navigate("/chat/admin", { state: { user: userDetails }, })}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Chat With Admin
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">

          {/* LEFT */}

          <div className="lg:col-span-1 space-y-6">

            {/* PROFILE */}

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">

              <h2 className="text-xl font-semibold mb-5 pb-3 border-b border-slate-600/70">
                👤 Profile
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-slate-400">
                    Name:
                  </span>{" "}
                  <strong>
                    {userdata?.name}
                  </strong>
                </p>

                <p>
                  <span className="text-slate-400">
                    Roll No:
                  </span>{" "}
                  <strong>
                    {userdata?.rollno}
                  </strong>
                </p>

                <p>
                  <span className="text-slate-400">
                    Email:
                  </span>{" "}
                  <strong>
                    {userdata?.email}
                  </strong>
                </p>

              </div>
            </div>

            {/* FILTER */}

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">

              <h3 className="text-lg font-semibold mb-5 pb-3 border-b border-slate-600/70">
                Filter Bill
              </h3>

              <div className="space-y-5">

                {/* YEAR */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Year
                  </label>

                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5"
                  >
                    {years.length === 0 ? (
                      <option value={selectedYear}>
                        {selectedYear}
                      </option>
                    ) : (
                      years.map((year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* MONTH */}

                <div>

                  <label className="block text-sm text-slate-300 mb-2">
                    Month
                  </label>

                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value
                      )
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5"
                  >
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07",
                      "08",
                      "09",
                      "10",
                      "11",
                      "12",
                    ].map((m, i) => (
                      <option
                        key={m}
                        value={m}
                      >
                        {new Date(
                          0,
                          i
                        ).toLocaleString(
                          "en-US",
                          {
                            month: "long",
                          }
                        )}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          </div>

          <div className="lg:col-span-3">

            {!filteredBill ? (

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-10 text-center text-slate-400 text-lg">

                No mess bill found for{" "}

                {new Date(
                  `${selectedYear}-${selectedMonth}-01`
                ).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}

              </div>

            ) : (

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl overflow-hidden">

                {/* BILL HEADER */}

                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  <h2 className="text-2xl font-bold">

                    {new Date(
                      `${filteredBill.month}-01`
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}

                  </h2>

                  <div className="flex items-center gap-6">

                    {/* PAYMENT STATUS */}

                    <div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold
                        ${filteredBill.status ===
                            "paid"
                            ? "bg-green-600/20 text-green-400 border border-green-500/30"
                            : "bg-red-600/20 text-red-400 border border-red-500/30"
                          }`}
                      >
                        {filteredBill.status ===
                          "paid"
                          ? "PAID"
                          : "UNPAID"}
                      </span>

                    </div>

                    {/* TOTAL */}

                    <div className="text-right">

                      <div className="text-sm text-slate-300">
                        Total Amount
                      </div>

                      <div className="text-2xl font-bold text-green-400">
                        ₹
                        {
                          filteredBill.totalAmount
                        }
                      </div>

                    </div>

                    {/* DOWNLOAD */}

                    {filteredBill.status ===
                      "paid" && (

                        <button
                          onClick={() =>
                            handleDownloadPdf(
                              filteredBill._id
                            )
                          }
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-medium"
                        >
                          Download PDF
                        </button>

                      )}

                  </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead className="bg-slate-700/80">

                      <tr>

                        <th className="p-4 text-left">
                          Date
                        </th>

                        <th className="p-4 text-center">
                          Breakfast
                        </th>

                        <th className="p-4 text-center">
                          Lunch
                        </th>

                        <th className="p-4 text-center">
                          Dinner
                        </th>

                        <th className="p-4 text-center">
                          Extras
                        </th>

                        <th className="p-4 text-center">
                          Total
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-700/50">

                      {filteredBill.days.map(
                        (day, idx) => (

                          <tr
                            key={idx}
                            className="hover:bg-slate-700/40"
                          >

                            <td className="p-4">

                              {new Date(
                                day.date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}

                            </td>

                            <td className="p-4 text-center">
                              ₹
                              {day.breakfast || 0}
                            </td>

                            <td className="p-4 text-center">
                              ₹
                              {day.lunch || 0}
                            </td>

                            <td className="p-4 text-center">
                              ₹
                              {day.dinner || 0}
                            </td>

                            <td className="p-4 text-center">
                              ₹
                              {day.extras || 0}
                            </td>

                            <td className="p-4 text-center font-semibold text-green-400">
                              ₹{day.total || 0}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>
                  </table>
                </div>

                {/* UNPAID MESSAGE */}

                {filteredBill.status !==
                  "paid" && (

                    <div className="px-6 py-4 bg-red-500/10 border-t border-red-500/20 text-red-300 text-sm">

                      Your bill is currently unpaid.
                      PDF download will be available after payment confirmation.

                    </div>

                  )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
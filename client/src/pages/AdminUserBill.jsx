
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import { Socket } from "socket.io-client";
const AdminUserBill = () => {
  const { rollno } = useParams();
  const navigate = useNavigate();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonth);
  const [days, setDays] = useState([]);
  const [savedBill, setSavedBill] = useState(null);
  const [userId, setUserId] = useState(null);
  const addDay = () => {
    setDays([
      ...days,
      {
        date: "",
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        extras: 0,
      },
    ]);
  };

  const handleMove = () => {
    navigate("/admin/dashboard");
  };

  const handleChange = (index, field, value) => {
    const updated = [...days];
    updated[index][field] = field === "date" ? value : Number(value);
    setDays(updated);
  };

  const calculateDayTotal = (day) => {
    return (
      (day.breakfast || 0) +
      (day.lunch || 0) +
      (day.dinner || 0) +
      (day.extras || 0)
    );
  };
  const fetchSavedBills = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/messbill/${rollno}?month=${month}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success && data.bills.length > 0) {
        setSavedBill(data.bills[0]);
        // console.log('==========>'+data.bills[0].user);
        setUserId(data.bills[0].user)
      } else {
        setSavedBill(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if (rollno && month) {
    fetchSavedBills();
    // }
  }, [rollno, month])

  // useEffect(() => {
  //   // console.log("Updated savedBill:", savedBill);
  // }, [savedBill]);

  const handleDelete = (biilId) => {
    console.log("i am delete handler");
    console.log(biilId);
  }

  // const socket = io("http://localhost:3400");


  // ✅ SAVE BILL
  const saveBill = async () => {
    try {
      const res = await fetch(`/api/admin/messbill/${rollno}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month, days }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Mess bill saved successfully");
        setSavedBill(data.bill);
        // socket.emit("billAdded", {
        //   userId,
        //   bill: savedBill
        // });
        // after saving bill
        setDays([]); // optional reset
      } else {
        alert("Failed to save bill");
      }
    } catch (err) {
      console.error(err);
    }
  };
  // console.log("roll no is:",rollno);
  // console.log(typeof rollno);
  // ✅ FETCH SAVED BILL



  return (
    <div className="min-h-screen bg-slate-900 text-white px-3 sm:px-6 py-6">

    {/* BACK BUTTON */}
    <button
      onClick={handleMove}
      className="mb-6 px-4 py-2 rounded-lg bg-amber-400 text-black hover:bg-amber-500 transition"
    >
      ⬅ Back to Dashboard
    </button>

    <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Mess Bill Management
          </h2>
          <p className="text-gray-400 text-sm">
            Roll No: <span className="text-white font-semibold">{rollno}</span>
          </p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
        />
      </div>

      {/* TABLE HEADER - Desktop */}
      <div className="hidden md:grid grid-cols-6 gap-4 text-gray-300 font-semibold mb-3">
        <span>Date</span>
        <span>Breakfast</span>
        <span>Lunch</span>
        <span>Dinner</span>
        <span>Extras</span>
        <span>Total</span>
      </div>

      {/* DAYS INPUT */}
      <div className="space-y-3">
        {days.map((day, index) => (
          <div
            key={index}
            className="bg-slate-700 rounded-lg p-3 grid grid-cols-1 md:grid-cols-6 gap-3 items-center"
          >
            <input
              type="date"
              className="bg-slate-800 px-3 py-2 rounded-lg w-full"
              value={day.date}
              onChange={(e) => handleChange(index, "date", e.target.value)}
            />

            <input
              type="number"
              placeholder="Breakfast"
              className="bg-slate-800 px-3 py-2 rounded-lg w-full"
              value={day.breakfast}
              onChange={(e) => handleChange(index, "breakfast", e.target.value)}
            />

            <input
              type="number"
              placeholder="Lunch"
              className="bg-slate-800 px-3 py-2 rounded-lg w-full"
              value={day.lunch}
              onChange={(e) => handleChange(index, "lunch", e.target.value)}
            />

            <input
              type="number"
              placeholder="Dinner"
              className="bg-slate-800 px-3 py-2 rounded-lg w-full"
              value={day.dinner}
              onChange={(e) => handleChange(index, "dinner", e.target.value)}
            />

            <input
              type="number"
              placeholder="Extras"
              className="bg-slate-800 px-3 py-2 rounded-lg w-full"
              value={day.extras}
              onChange={(e) => handleChange(index, "extras", e.target.value)}
            />

            <div className="text-green-400 font-bold text-center md:text-left">
              ₹ {calculateDayTotal(day)}
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={addDay}
          className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          + Add Day
        </button>

        <button
          onClick={saveBill}
          className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
          Save Bill
        </button>

        <button
          onClick={fetchSavedBills}
          className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
        >
          Fetch Saved
        </button>
      </div>

      {/* SAVED BILL */}
      {savedBill && (
        <div className="mt-10 bg-slate-700 p-4 sm:p-6 rounded-xl">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold">
              Saved Bill - {savedBill.month}
            </h3>

            <button
              onClick={() => handleDelete(savedBill._id)}
              className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm"
            >
              Delete
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:grid grid-cols-6 gap-4 text-gray-300 font-semibold mb-3">
            <span>Date</span>
            <span>Breakfast</span>
            <span>Lunch</span>
            <span>Dinner</span>
            <span>Extras</span>
            <span>Total</span>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3">
            {savedBill.days.map((day, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-3 grid grid-cols-2 md:grid-cols-6 gap-2"
              >
                <span className="col-span-2 md:col-span-1">
                  {new Date(day.date).toISOString().slice(0, 10)}
                </span>
                <span> {day.breakfast}</span>
                <span> {day.lunch}</span>
                <span> {day.dinner}</span>
                <span>{day.extras}</span>
                <span className="text-green-400 font-bold">
                  ₹ {day.total}
                </span>
              </div>
            ))}
          </div>

          <div className="text-right text-lg sm:text-xl font-bold text-yellow-400 mt-4">
            Monthly Total: ₹ {savedBill.totalAmount}
          </div>
        </div>
      )}

    </div>
  </div>
  );
};

export default AdminUserBill;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminUserDetails = () => {
    const { rollno } = useParams();
    const navigate = useNavigate();

    const [bills, setBills] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `/api/admin/messbill/${rollno}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            console.log("--->", data);
            // console.log(rollno);
            if (data.success) {
                setBills(data.bills);

                const billUser = data.bills?.[0]?.user;
                const fallbackUser = typeof billUser === "string"
                    ? { _id: billUser, rollno }
                    : billUser;

                setUser(data.user || fallbackUser || null);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchBills();
    }, []);

    const togglePaymentStatus = async (billId) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `/api/bill/status/${billId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            if (data.success) {
                fetchBills();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const totalBills = bills.length;

    const paidBills = bills.filter(
        (bill) => bill.status === "paid"
    ).length;

    const unpaidBills = bills.filter(
        (bill) => bill.status === "unpaid"
    ).length;

    const totalRevenue = bills.reduce(
        (acc, curr) => acc + curr.totalAmount,
        0
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white px-4 py-6">

            {/* TOP BAR */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div>
                    <h1 className="text-3xl font-bold">
                        Student Billing Details
                    </h1>

                    <p className="text-slate-400 mt-1">
                        Roll No : {rollno}
                    </p>

                    {user && (
                        <p className="text-slate-300 mt-1">
                            Name : {user.name}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">

                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600"
                    >
                        Back
                    </button>

                    <button
                        onClick={() => navigate(`/admin/chat/${user._id}`)}
                        disabled={!user?._id}
                        className={`px-4 py-2 rounded-lg ${user?._id
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-slate-600 cursor-not-allowed"
                            }`}
                    >
                        Chat With Student
                    </button>

                </div>

            </div>

            {/* STATS */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                <div className="bg-slate-800 p-5 rounded-xl">
                    <p className="text-slate-400">Total Bills</p>

                    <h2 className="text-3xl font-bold mt-2">
                        {totalBills}
                    </h2>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl">
                    <p className="text-slate-400">Paid Bills</p>

                    <h2 className="text-3xl font-bold text-green-400 mt-2">
                        {paidBills}
                    </h2>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl">
                    <p className="text-slate-400">Pending Bills</p>

                    <h2 className="text-3xl font-bold text-red-400 mt-2">
                        {unpaidBills}
                    </h2>
                </div>

                <div className="bg-slate-800 p-5 rounded-xl">
                    <p className="text-slate-400">Total Revenue</p>

                    <h2 className="text-3xl font-bold text-yellow-400 mt-2">
                        ₹ {totalRevenue}
                    </h2>
                </div>

            </div>

            {/* BILLS TABLE */}
            <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl overflow-hidden">

                {/* HEADER */}
                <div className="hidden md:grid grid-cols-5 bg-slate-700 px-6 py-4 font-semibold">
                    <div>Month</div>
                    <div>Total Amount</div>
                    <div>Status</div>
                    <div>Created At</div>
                    <div className="text-right">Actions</div>
                </div>

                {/* EMPTY STATE */}
                {bills.length === 0 ? (

                    <div className="text-center py-10 text-slate-400">

                        <p>No Bills Found</p>

                        <button
                            onClick={() =>
                                navigate(`/admin/bill/${rollno}`)
                            }
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Create First Bill
                        </button>

                    </div>

                ) : (

                    bills.map((bill) => (

                        <div
                            key={bill._id}
                            className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-0 px-6 py-5 border-b border-slate-700 hover:bg-slate-700/40 transition"
                        >

                            {/* MONTH */}
                            <div>
                                <span className="md:hidden font-semibold">
                                    Month :
                                </span>{" "}
                                {bill.month}
                            </div>

                            {/* AMOUNT */}
                            <div>
                                <span className="md:hidden font-semibold">
                                    Amount :
                                </span>{" "}
                                ₹ {bill.totalAmount}
                            </div>

                            {/* STATUS */}
                            <div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${bill.status === "paid"
                                            ? "bg-green-600/20 text-green-400"
                                            : "bg-red-600/20 text-red-400"
                                        }`}
                                >
                                    {bill.status}
                                </span>
                            </div>

                            {/* CREATED DATE */}
                            <div>
                                {new Date(bill.createdAt)
                                    .toISOString()
                                    .slice(0, 10)}
                            </div>

                            {/* ACTIONS */}
                            <div className="flex flex-wrap md:justify-end gap-2">

                                {/* PAYMENT BUTTON */}
                                <button
                                    onClick={() =>
                                        togglePaymentStatus(bill._id)
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm
                                    ${bill.status === "paid"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {bill.status === "paid"
                                        ? "Mark Unpaid"
                                        : "Mark Paid"}
                                </button>

                                {/* CREATE / EDIT BILL */}
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/admin/user/${rollno}`
                                        )
                                    }
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                                >
                                    Create / Edit Bill
                                </button>

                            </div>

                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default AdminUserDetails;

import User from "../models/user.model.js";
import messBill from "../models/messBilling.model.js";
import { io } from "../index.js";


export const messbilling = async (req, res) => {
  try {
    const rollno = req.params.rollno;   // keep as string
    const { month, days } = req.body;

    // console.log("BODY RECEIVED:", req.body);

    const user = await User.findOne({ rollno });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let bill = await messBill.findOne({ user: user._id, month });

    // If bill exists → update days
    // console.log("My pAST Billing is ", bill);
    if (bill) {
      days.forEach((newDay) => {
        const index = bill.days.findIndex(
          (d) =>
            new Date(d.date).toISOString().slice(0, 10) === newDay.date
        );

        if (index !== -1) {
          //  Update existing date
          bill.days[index].breakfast = (bill.days[index].breakfast || 0) + Number(newDay.breakfast || 0);
          bill.days[index].lunch = (bill.days[index].lunch || 0) + Number(newDay.lunch || 0);
          bill.days[index].dinner = (bill.days[index].dinner || 0) + Number(newDay.dinner || 0);
          bill.days[index].extras = (bill.days[index].extras || 0) + Number(newDay.extras || 0);
        } else {
          //  Add new date
          bill.days.push({
            date: newDay.date,
            breakfast: Number(newDay.breakfast) || 0,
            lunch: Number(newDay.lunch) || 0,
            dinner: Number(newDay.dinner) || 0,
            extras: Number(newDay.extras) || 0,
          });
        }
      });
    } else {
      //  Create new monthly bill
      bill = new messBill({
        user: user._id,
        rollno,
        month,
        days: days.map((d) => ({
          date: d.date,
          breakfast: Number(d.breakfast) || 0,
          lunch: Number(d.lunch) || 0,
          dinner: Number(d.dinner) || 0,
          extras: Number(d.extras) || 0,
        })),
      });
    }

    await bill.save();

    // console.log("-->>>",user._id.toString());
    io.to(user._id.toString()).emit("new-bill", {
      message: "New mess bill added"
    });

    // console.log("Realtime bill sent to:", user._id.toString());
    res.status(200).json({
      success: true,
      bill,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Bill save failed",
    });
  }
};


// // ================= UPDATE BILL =================

export const updateBill = async (req, res) => {
  try {

    const { billId, dayId } = req.params;

    const {
      breakfast,
      lunch,
      dinner,
      extras,
    } = req.body;

    const bill = await messBill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // FIND DAY
    const day = bill.days.id(dayId);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: "Day not found",
      });
    }

    // UPDATE VALUES
    day.breakfast = Number(breakfast || 0);
    day.lunch = Number(lunch || 0);
    day.dinner = Number(dinner || 0);
    day.extras = Number(extras || 0);

    // UPDATE TOTAL OF DAY
    day.total =
      day.breakfast +
      day.lunch +
      day.dinner +
      day.extras;

    // UPDATE MONTH TOTAL
    bill.totalAmount = bill.days.reduce(
      (acc, curr) => acc + curr.total,
      0
    );

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Day updated successfully",
      bill,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const deleteDayBill = async (req, res) => {
  try {

    const { billId, dayId } = req.params;

    const bill = await messBill.findById(billId)

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // REMOVE DAY
    bill.days = bill.days.filter(
      (day) => day._id.toString() !== dayId
    );

    // RECALCULATE TOTAL
    bill.totalAmount = bill.days.reduce(
      (acc, curr) => acc + curr.total,
      0
    );

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Day deleted successfully",
      bill,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteMonthBill = async (req, res) => {
  try {

    const { billId } = req.params;

    const bill = await messBill.findByIdAndDelete(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Monthly bill deleted successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const togglePaymentStatus = async (req, res) => {
    try {

        const { billId } = req.params;

        const bill = await messBill.findById(billId);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found",
            });
        }

        bill.status =
            bill.status === "paid"
                ? "unpaid"
                : "paid";

        await bill.save();

        res.status(200).json({
            success: true,
            message: "Payment status updated",
            status: bill.status,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
import User from "../models/user.model.js";
import messBill from "../models/messBilling.model.js";
import { io } from "../index.js";
// export const messbilling = async (req, res) => {
//   try {
//     const rollno = Number(req.params.rollno);
//     const { month, days } = req.body;

//     const user = await User.findOne({ rollno });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     let bill = await messBill.findOne({ user: user._id, month });

//     if (bill) {
//       days.forEach((newDay) => {
//         const index = bill.days.findIndex(
//           (d) => d.date === newDay.date
//         );

//         if (index !== -1) {
//           bill.days[index].charge =
//             Number(bill.days[index].charge) + Number(newDay.charge);

//           bill.days[index].present = newDay.present;
//         } else {
//           // add new day
//           bill.days.push(newDay);
//         }
//       });

//     } else {
//       // create new bill
//       bill = new messBill({
//         user: user._id,
//         rollno,
//         month,
//         days,
//       });
//     }

//     // 🔢 RECALCULATE TOTAL
//     bill.totalAmount = bill.days
//       .filter(day => day.present)
//       .reduce((sum, day) => sum + Number(day.charge), 0);

//     await bill.save();

//     res.status(200).json({
//       success: true,
//       bill,
//     });

//   } catch (error) {
//     console.log("ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Bill save failed",
//     });
//   }
// };
// ------------------------------------------------------------ //



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

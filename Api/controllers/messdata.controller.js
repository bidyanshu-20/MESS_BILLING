import messBill from "../models/messBilling.model.js";
import User from "../models/user.model.js";
// export const getUserMessBillByRollno = async (req, res) => {
//   try {
//     const rollno = Number(req.params.rollno); // ✅ convert

//     console.log("Requested rollno:", rollno);
//     // console.log("Logged-in user rollno:", req.user.rollno);

//     // ✅ Security check (same type)
//     if (req.user.rollno !== rollno){
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized access",
//       });
//     }

//     // ✅ Fetch bills
//     const bills = await messBill.find({ rollno });

//     console.log("Bills found:", bills); // ✅ NOW this will print

//     res.status(200).json({
//       success: true,
//       bills,
//     });
//   } catch (error) {
//     console.log("ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch bill",
//     });
//   }
// };

export const getUserMessBill = async (req, res) => {
  try {

    // console.log("Logged-in-user:", req.user); 

    const bills = await messBill.find({ user: req.user._id }).populate("user");
    // console.log("user mess bill ");
    // console.log(bills);
    res.status(200).json({
      user: {

        name: req.user.name,
        rollno: req.user.rollno,
        email: req.user.email,
      },
      success: true,
      bills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


// export const getUserMessBill = async (req, res) => {
//   try {

//     console.log("Logged-in-user:", req.user);
//     const bills = await messBill.find({ user: req.user._id });

//     // month-wise object
//     const groupedBills = {};

//     bills.forEach((bill) => {
//       groupedBills[bill.month] = bill.days;
//     });

//     res.status(200).json({
//       success: true,
//       bills: groupedBills,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false });
//   }
// };

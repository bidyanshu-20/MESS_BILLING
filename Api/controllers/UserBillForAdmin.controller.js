import User from "../models/user.model.js";
import messBill from "../models/messBilling.model.js";

export const getAdminUserMessBill = async (req, res) => {
    try {
        const rollno = (req.params.rollno);
        const { month } = req.query;
        // console.log("ROLL No Is :", rollno);
        // console.log("Type:", typeof rollno);


        const user = await User.findOne({ rollno });
        // console.log(user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const filter = { user: user._id };
        // console.log("----->",filter);
        if (month) {
            filter.month = month;
        }

        // console.log("----------");

        const bills = await messBill.find(filter).sort({ month: -1 });
        // console.log("Bills is ----->",bills);
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                rollno: user.rollno,
                role: user.role,
            },
            bills,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user bill",
        });
    }
};


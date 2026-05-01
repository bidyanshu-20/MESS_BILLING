import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from "../config/sendEmail.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res, next) => {

    // console.log(req.body);

    const { name, email, password, rollno } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }

    const existingUser2 = await User.findOne({ rollno });
    if (existingUser2) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, rollno, role: "user" });
    try {
        await newUser.save();
        res.status(201).json("User Created successfully");
    }
    catch (error) {
        next(error);
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const validUser = await User.findOne({ email });
        // console.log({email,password});
        if (!validUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // console.log("----");
        const isMatch = bcryptjs.compareSync(password, validUser.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // if (validUser.role !== role) {
        //     return res.status(403).json({
        //         message: `You are not registered as ${role}`,
        //     });
        // }

        const token = jwt.sign({ id: validUser._id }, "hghghghghgh");

        const { password: pass, ...rest } = validUser._doc;

        res.cookie("access_token", token, { httpOnly: true }).status(200).json({
            success: true,
            token,
            user: rest
        });

    }
    catch (error) {
        next(error);
    }
}


// update user will be done 
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        // console.log("UID---->",userId);
        const { name, email, rollno } = req.body;
        // console.log("---->",req.body);

        const updateFields = {};

        // Update name if provided
        if (name) {
            updateFields.name = name;
        }

        if (email) {
            updateFields.email = email;
        }
        const existingUser = await User.findOne({
            rollno,
            _id: { $ne: userId }
        });

        if (rollno) {
            const existingUser = await User.findOne({
                rollno,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Roll number already exists",
                });
            }

            updateFields.rollno = rollno;
        }
        // if()


        // Update password if provided
        // if (password) {
        //     const salt = await bcrypt.genSalt(10);
        //     const hashedPassword = await bcrypt.hash(password, salt);
        //     updateFields.password = hashedPassword;
        // }

        // If nothing to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password"); // do not return password

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Update Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating profile",
        });
    }
};


// here is the controller to handle the delete user account by admin 


export const adminDeleteUser = async (req, res) => {
    try {
        const adminId = req.user._id;
        const userIdToDelete = req.params.id;

        if (adminId.toString() === userIdToDelete) {
            return res.status(400).json({
                success: false,
                message: "Admin cannot delete own account",
            });
        }

        // console.log("i am delete user controller ");
        // console.log("Admin id is:",adminId)
        // console.log("user id is:",userIdToDelete);

        const deletedUser = await User.findByIdAndDelete(userIdToDelete);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (error) {
        console.error("Admin Delete Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting user",
        });
    }
};


// handleForgotpassword

export const handleForgotpassword = async (req, res) => {
    const { email } = req.body;
    console.log("---->"+email);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exit..." });
        }
        const otp = Math.floor(100000 + Math.random() * 999999);
        console.log("Otp is ", otp);
        const newOtp = new Otp({
            email,
            otp
        })


        await newOtp.save();
        console.log("-----hellooooo");
        const message = `Your verification code for password reset is ${otp}`
        await sendEmail(email, "Reset Password", message)
        console.log("hellooooo");
        res.status(200).json({ message: "Otp sent your email" });
    }
    catch (error) {
         console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server Error..." })
    }
}

// handleverifyOtp;

export const handleverifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord || Date.now() > otpRecord.createdAt.getTime() + 60 * 60 * 1000) {
            return res.status(400).json({ message: "Invalid or expired Otp" })
        }
        res.status(200).json({ message: "Otp Verification successful" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error..." })
    }
}

// handleResetPassword 

export const handleResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email, otp });
        if (!otpRecord || Date.now() > otpRecord.createdAt.getTime() + 60 * 60 * 1000) {
            res.status(400).json({ message: "Invalid or expired Otp" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Does not exits" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await Otp.deleteMany({ email });
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server Error..." })
    }
}
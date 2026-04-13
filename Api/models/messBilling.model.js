// import mongoose from "mongoose";

// const messBillSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     rollno: {
//       type: String,
//       required: true,
//     },

//     month: {
//       type: String, // "2026-01"
//       required: true,
//     },
//     days: [
//       {
//         date: String,       // "2026-01-01"
//         present: Boolean,   // true / false
//         charge: Number,     // per-day charge
//       },
//     ],

//     totalAmount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// const messBill = mongoose.model('MessBill', messBillSchema);
// export default messBill;


import mongoose from "mongoose";

const dailyMealSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },

  breakfast: {
    type: Number,
    default: 0,
  },

  lunch: {
    type: Number,
    default: 0,
  },

  dinner: {
    type: Number,
    default: 0,
  },

  extras: {
    type: Number,
    default: 0,
  },

  total: {
    type: Number,
    default: 0,
  },
});

const messBillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userdata",
      required: true,
    },

    rollno: {
      type: String,
      required: true,
    },

    month: {
      type: String, // "2026-01"
      required: true,
    },

    days: [dailyMealSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

messBillSchema.pre("save", function (next) {
  let monthlyTotal = 0;

  this.days.forEach((day) => {
    day.total =
      (day.breakfast || 0) +
      (day.lunch || 0) +
      (day.dinner || 0) +
      (day.extras || 0);

    monthlyTotal += day.total;
  });

  this.totalAmount = monthlyTotal;

  // next();
});
// 🔥 Prevent duplicate month for same user
messBillSchema.index({ user: 1, month: 1 }, { unique: true });

const MessBill = mongoose.model("MessBill", messBillSchema);
export default MessBill;

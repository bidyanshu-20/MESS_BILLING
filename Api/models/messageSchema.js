import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Userdata",
            required: true,
        },

        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Userdata",
            required: true,
        },

        text: {
            type: String,
            default: "",
        },

        attachment: {
            name: {
                type: String,
                default: "",
            },
            type: {
                type: String,
                default: "",
            },
            size: {
                type: Number,
                default: 0,
            },
            dataUrl: {
                type: String,
                default: "",
            },
        },

        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Userdata",
            },
        ],

        deletedForEveryone: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatMessageTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatFileSize = (size = 0) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getInitials = (name = "User") =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const ChatWithUser = () => {
    const admin = JSON.parse(localStorage.getItem("user"));
    const { userId } = useParams();
    const socket = useRef(null);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const [student, setStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!userId || userId === "undefined") return;

        fetch(`/api/chat/user/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setStudent(data.user);
            })
            .catch((error) => console.log("Failed to load student:", error));
    }, [userId]);

    useEffect(() => {
        if (!userId || userId === "undefined" || !admin?._id) {
            setError("Chat user details are missing. Please login again.");
            return;
        }

        socket.current = io("http://localhost:3400");
        socket.current.on("connect_error", () => setError("Unable to connect to chat server"));
        socket.current.emit("joinRoom", userId);

        fetch(`/api/chat/${admin._id}/${userId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setMessages(data.messages);
                else setError(data.message || "Failed to load messages");
            })
            .catch((error) => {
                console.log("Failed to load messages:", error);
                setError("Failed to load messages");
            });

        socket.current.on("receiveMessage", (message) => setMessages((prev) => [...prev, message]));

        socket.current.on("messageDeleted", ({ messageId, message }) => {
            setMessages((prev) => prev.map((item) => (item._id === messageId ? message : item)));
        });

        socket.current.on("messageError", (data) => setError(data.message || "Failed to send message"));

        return () => {
            socket.current.off("connect_error");
            socket.current.off("receiveMessage");
            socket.current.off("messageDeleted");
            socket.current.off("messageError");
            socket.current.disconnect();
        };
    }, [userId, admin?._id]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError("File must be 5 MB or smaller");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedFile({
                name: file.name,
                type: file.type || "application/octet-stream",
                size: file.size,
                dataUrl: reader.result,
            });
            setError("");
        };
        reader.readAsDataURL(file);
    };

    const sendMessage = () => {
        if ((!text.trim() && !selectedFile) || !socket.current || !userId || userId === "undefined") return;

        setError("");

        socket.current.emit(
            "sendMessage",
            {
                roomId: userId,
                senderId: admin._id,
                receiverId: userId,
                text,
                attachment: selectedFile,
            },
            (response) => {
                if (!response?.success) {
                    setError(response?.message || "Failed to send message");
                    return;
                }

                setText("");
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        );
    };

    const deleteMessage = (messageId, deleteType) => {
        if (!socket.current || !messageId) return;
        setOpenMenuId(null);

        socket.current.emit(
            "deleteMessage",
            { messageId, currentUserId: admin._id, roomId: userId, deleteType },
            (response) => {
                if (!response?.success) {
                    setError(response?.message || "Failed to delete message");
                    return;
                }

                if (deleteType === "me") {
                    setMessages((prev) => prev.filter((message) => message._id !== messageId));
                }
            }
        );
    };

    const renderAttachment = (attachment) => {
        if (!attachment?.dataUrl) return null;
        const isImage = attachment.type?.startsWith("image/");

        return (
            <a
                href={attachment.dataUrl}
                download={attachment.name}
                className="mt-2 block rounded-xl bg-black/20 p-3 hover:bg-black/30"
            >
                {isImage && (
                    <img
                        src={attachment.dataUrl}
                        alt={attachment.name}
                        className="mb-2 max-h-56 rounded-lg object-contain"
                    />
                )}
                <div className="text-sm font-medium">{attachment.name}</div>
                <div className="text-xs text-white/70">{formatFileSize(attachment.size)}</div>
            </a>
        );
    };

    const contactName = student?.name || "Student";

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-emerald-600 flex items-center justify-center font-bold overflow-hidden">
                    {student?.profilePic ? (
                        <img src={student.profilePic} alt={contactName} className="h-full w-full object-cover" />
                    ) : (
                        getInitials(contactName)
                    )}
                </div>
                <div>
                    <h1 className="text-xl font-bold">{contactName}</h1>
                    <p className="text-slate-400 text-sm">Student chat</p>
                </div>
            </div>

            {error && <div className="bg-red-500/20 text-red-200 px-6 py-3 text-sm">{error}</div>}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === admin._id;
                    const senderName = isMine ? admin.name : contactName;

                    return (
                        <div key={msg._id || index} className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine && (
                                <div className="h-8 w-8 rounded-full bg-slate-600 flex shrink-0 items-center justify-center text-xs font-bold">
                                    {getInitials(senderName)}
                                </div>
                            )}

                            <div className={`max-w-[72%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                <p className="mb-1 text-xs text-slate-400">{senderName}</p>

                                <div className={`relative group px-4 py-2 rounded-2xl break-words ${isMine ? "bg-green-600" : "bg-slate-700"} ${msg.deletedForEveryone ? "italic text-slate-200" : ""}`}>
                                    {msg._id && (
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === msg._id ? null : msg._id)}
                                            className={`absolute top-1 ${isMine ? "left-2" : "right-2"} hidden group-hover:block rounded-full px-2 py-0.5 text-xs bg-black/20 hover:bg-black/40`}
                                        >
                                            ...
                                        </button>
                                    )}

                                    {openMenuId === msg._id && (
                                        <div className={`absolute top-7 z-10 w-44 rounded-lg bg-slate-950 py-2 text-sm shadow-xl border border-slate-700 ${isMine ? "right-0" : "left-0"}`}>
                                            <button onClick={() => deleteMessage(msg._id, "me")} className="block w-full px-4 py-2 text-left hover:bg-slate-800">
                                                Delete for me
                                            </button>
                                            {isMine && !msg.deletedForEveryone && (
                                                <button onClick={() => deleteMessage(msg._id, "everyone")} className="block w-full px-4 py-2 text-left text-red-300 hover:bg-slate-800">
                                                    Delete for everyone
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {msg.text && <div className="pr-6">{msg.text}</div>}
                                    {!msg.deletedForEveryone && renderAttachment(msg.attachment)}

                                    <div className="mt-1 text-[11px] text-white/70 text-right">
                                        {formatMessageTime(msg.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {selectedFile && (
                <div className="bg-slate-800 px-4 py-2 text-sm text-slate-200 flex items-center justify-between border-t border-slate-700">
                    <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                    <button onClick={() => setSelectedFile(null)} className="text-red-300 hover:text-red-200">
                        Remove
                    </button>
                </div>
            )}

            <div className="p-4 border-t border-slate-700 flex gap-3">
                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-lg">
                    Attach
                </button>

                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Type message..."
                    className="flex-1 bg-slate-800 px-4 py-3 rounded-lg outline-none"
                />

                <button onClick={sendMessage} className="bg-green-600 hover:bg-green-700 px-6 rounded-lg">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWithUser;

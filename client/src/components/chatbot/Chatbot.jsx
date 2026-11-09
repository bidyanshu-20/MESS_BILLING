import React, { useState } from "react";
import axios from "axios";

const Chatbot = ({ month }) => {
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I am your Mess AI Assistant. How can I help you?"
        }
    ]);
    const API_BASE = import.meta.env.VITE_BACKEND_URL;
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();

        // Display user's message immediately
        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);

        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_BASE}/api/chatbot/ask`,
                {
                    message: userMessage,
                    month,
                    history: messages
                        .slice(1)
                        .slice(-10)
                        .map(({ role, content }) => ({ role, content }))
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data.success || typeof response.data.answer !== "string") {
                throw new Error(response.data.message || "The AI assistant returned an invalid response.");
            }

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: response.data.answer
                }
            ]);

        } catch (error) {
            console.error("Chatbot error:", error);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: error.response?.data?.message ||
                        "Sorry, something went wrong. Please try again."
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chatbot Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50
                bg-green-600 text-white rounded-full
                w-14 h-14 shadow-lg text-2xl"
            >
                💬
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50
                w-80 sm:w-96 h-[500px]
                bg-white shadow-2xl rounded-xl
                border flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="bg-green-700 text-white p-4
                    flex justify-between items-center">

                        <div>
                            <h2 className="font-bold">
                                Mess AI Assistant
                            </h2>

                            <p className="text-xs">
                                Ask me about your mess bills
                            </p>
                        </div>

                        <button onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`p-3 rounded-lg max-w-[85%] text-sm ${msg.role === "user"
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <p className="text-sm text-gray-500">
                                AI is typing...
                            </p>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t p-3 flex gap-2">

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            placeholder="Ask something..."
                            className="flex-1 border rounded-lg
                            px-3 py-2 text-black  outline-none text-sm"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="bg-green-600 text-white
                            px-4 rounded-lg disabled:opacity-50"
                        >
                            Send
                        </button>

                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
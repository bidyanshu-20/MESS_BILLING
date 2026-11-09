import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const QUICK_PROMPTS = [
    { label: "💰 Total Bill", query: "What is my total bill for this month?" },
    { label: "💳 Payment Status", query: "Is my bill paid or unpaid?" },
    { label: "🍽️ Meal Breakdown", query: "Show my meal breakdown (breakfast, lunch, dinner, extras)" },
    { label: "📅 Meal History", query: "Show my recent meal history" },
    { label: "📋 All Bills", query: "Show all my bills and pending dues" }
];

const Chatbot = ({ month }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hello! I am your Mess AI Assistant. Ask me anything about your mess bills, meal breakdown, or payment status!"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_BASE = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

    // Automatically scroll to the latest message
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading, isOpen]);

    const handleSend = async (textToSend) => {
        const queryText = (typeof textToSend === "string" ? textToSend : input).trim();
        if (!queryText || loading) return;

        // Display user's message immediately
        setMessages(prev => [
            ...prev,
            {
                role: "user",
                content: queryText
            }
        ]);

        setInput("");
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ Please log in to your account to check your mess bill details."
                }
            ]);
            setLoading(false);
            return;
        }

        try {
            const url = API_BASE ? `${API_BASE}/api/chatbot/ask` : "/api/chatbot/ask";

            const response = await axios.post(
                url,
                {
                    message: queryText,
                    month: month || undefined,
                    history: messages
                        .slice(1)
                        .slice(-8)
                        .map(({ role, content }) => ({ role, content }))
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data || !response.data.success || typeof response.data.answer !== "string") {
                throw new Error(response.data?.message || "The AI assistant returned an invalid response.");
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

            const fallbackMessage =
                error.response?.data?.message ||
                "Sorry, I had trouble processing your question. Please try again.";

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: fallbackMessage
                }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                role: "assistant",
                content: "Chat cleared. What else would you like to know about your mess bills?"
            }
        ]);
    };

    return (
        <>
            {/* Floating Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open Mess Assistant Chat"
                className="fixed bottom-6 right-6 z-50
                bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500
                text-white rounded-full w-14 h-14 shadow-2xl flex items-center justify-center text-2xl
                transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 z-50
                w-[92vw] sm:w-96 max-w-[420px] h-[540px]
                bg-white dark:bg-slate-900 shadow-2xl rounded-2xl
                border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-700 to-green-700 text-white p-4
                    flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <div>
                                <h2 className="font-bold text-sm sm:text-base leading-tight">
                                    Mess AI Assistant
                                </h2>
                                <p className="text-[11px] text-emerald-100">
                                    {month ? `Active Month: ${month}` : "Ask about your bills"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearChat}
                                title="Clear conversation"
                                className="text-xs bg-emerald-800/80 hover:bg-emerald-800 px-2 py-1 rounded transition text-emerald-100 hover:text-white"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                                className="text-emerald-100 hover:text-white text-lg px-1 transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                                        msg.role === "user"
                                            ? "bg-emerald-600 text-white rounded-br-none"
                                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-100" />
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-200" />
                                <span>AI is thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(prompt.query)}
                                disabled={loading}
                                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50"
                            >
                                {prompt.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Footer */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask about your bill, meals, dues..."
                            className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />

                        <button
                            onClick={() => handleSend()}
                            disabled={loading || !input.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
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

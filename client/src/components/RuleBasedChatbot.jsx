import { useEffect, useRef, useState } from "react";

const rules = [
  {
    pattern: /login|sign in|account/i,
    response:
      "To access your mess billing dashboard, click Login and enter your registered credentials.",
  },
  {
    pattern: /signup|register|create account/i,
    response:
      "You can create a new account by clicking Sign Up and filling in your details.",
  },
  {
    pattern: /bill|billing|monthly bill|payment/i,
    response:
      "This system helps track monthly mess bills and payments clearly for each student.",
  },
  {
    pattern: /admin|administrator|admin control/i,
    response:
      "Admin access lets you manage users and billing details from the dashboard.",
  },
  {
    pattern: /forgot password|reset password|password/i,
    response:
      "If you forgot your password, use the Reset Password page to recover your account.",
  },
  {
    pattern: /home|welcome|landing/i,
    response:
      "Welcome to the Mess Billing System homepage. Use the chat bubble to ask about login, signup, bills, or admin access.",
  },
  {
    pattern: /help|support|question/i,
    response:
      "Ask me anything about the application: login, signup, bill tracking, admin control, or password reset.",
  },
];

const getBotResponse = (message) => {
  const normalized = message.trim();
  if (!normalized) {
    return "Please type a question so I can help you.";
  }

  const match = rules.find((rule) => rule.pattern.test(normalized));
  if (match) {
    return match.response;
  }

  return (
    "I’m here to help with the Mess Billing System. " +
    "Try asking about login, signup, monthly bills, admin control, or password reset."
  );
};

const RuleBasedChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I’m MessBot. Ask me about login, signup, bills, admin access, or password reset.",
    },
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const userMessage = { from: "user", text: input.trim() };
    const botMessage = { from: "bot", text: getBotResponse(input) };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open ? (
        <div className="w-[340px] sm:w-[380px] bg-slate-950/95 border border-white/10 shadow-2xl shadow-black/40 rounded-3xl overflow-hidden backdrop-blur-xl text-white">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-700 via-slate-900 to-violet-700 border-b border-white/10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                MessBot
              </p>
              <p className="text-base font-semibold">Rule-based support</p>
            </div>
            <button
              type="button"
              className="text-slate-200 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3 bg-slate-950">
            {messages.map((message, index) => (
              <div
                key={`${message.from}-${index}`}
                className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-3xl px-4 py-3 leading-relaxed text-sm shadow-sm ${
                    message.from === "user"
                      ? "bg-gradient-to-r from-amber-300/20 to-orange-400/20 text-orange-100"
                      : "bg-slate-900/90 text-slate-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 px-4 py-3 bg-slate-950/95">
            <label htmlFor="chat-input" className="sr-only">
              Ask MessBot a question
            </label>
            <div className="flex gap-3">
              <input
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about login, bills, admin..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 hover:brightness-110 transition"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-slate-950 font-semibold shadow-2xl shadow-orange-500/30 hover:-translate-y-0.5 transition-transform"
        >
          <span>Chat with MessBot</span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-orange-600 shadow-inner">
            💬
          </span>
        </button>
      )}
    </div>
  );
};

export default RuleBasedChatbot;

import openai from "../services/openaiService.js";
import messBill from "../models/messBilling.model.js";

/**
 * Intelligent local billing assistant that generates accurate, helpful
 * answers from the student's MongoDB billing data.
 * Used whenever OpenAI is unavailable, rate-limited (e.g. quota exhausted), or not configured.
 */
export const generateLocalBillingAnswer = (question, billingContext) => {
    const q = question.toLowerCase().trim();

    // 1. Greetings
    if (/^(hi|hello|hey|hiya|good morning|good afternoon|good evening|namaste)[!?.\s]*$/i.test(q)) {
        return "Hi! I am your Mess AI Assistant. I can help you check your mess bill, meal breakdown (breakfast, lunch, dinner, extras), payment status, and history. What would you like to know?";
    }

    // 2. Who are you / Capabilities / Help
    if (/who are you|what can you do|help me|what is this|commands/i.test(q)) {
        return "I am your Mess AI Assistant. Here are some things you can ask me:\n" +
            "• 💰 'What is my total bill for this month?'\n" +
            "• 💳 'Is my bill paid or unpaid?'\n" +
            "• 🍽️ 'Show my meal breakdown (breakfast, lunch, dinner, extras)'\n" +
            "• 📅 'Show my recent meal history'\n" +
            "• 📋 'Show all my bills and pending dues'";
    }

    // 3. Modifying bill / online payment / contact admin
    if (/change|modify|wrong|incorrect|update|contact admin|pay online/i.test(q)) {
        return "Mess bills and payment statuses are managed by the mess administrator. If you notice any discrepancy or have made a payment, please contact the mess office to update your record.";
    }

    // 4. How calculation works / formula
    if (/how.*(calculate|formula|work)|calculation/i.test(q)) {
        return `Mess bills are calculated as follows:\n` +
            `1. Daily Total = Breakfast + Lunch + Dinner + Extras.\n` +
            `2. Monthly Bill = Sum of all daily totals for that month.\n` +
            `You can check your detailed breakdown anytime!`;
    }

    const { found, currentBill, requestedMonth, latestRecordedBill, allRecordedMonths, totalUnpaidDues } = billingContext;

    // 5. Overall / All Bills / Dues across all months
    if (/all bills|all my bills|other months|previous bills|all months|total dues|pending dues|pending bill/i.test(q)) {
        if (!allRecordedMonths || allRecordedMonths.length === 0) {
            return "You do not have any mess billing records in the system yet.";
        }
        const monthsList = allRecordedMonths.join(", ");
        const dueText = totalUnpaidDues > 0
            ? `⚠️ Total unpaid dues across all months: ₹${totalUnpaidDues}.`
            : "✅ You have no pending dues! All recorded bills are paid.";

        let response = `You have ${allRecordedMonths.length} recorded bill(s) for: ${monthsList}.\n${dueText}`;
        if (latestRecordedBill) {
            response += `\nLatest bill (${latestRecordedBill.month}): ₹${latestRecordedBill.totalAmount} (${latestRecordedBill.status.toUpperCase()}).`;
        }
        return response;
    }

    // 6. Case where no bill is found for requested month
    if (!found) {
        let msg = requestedMonth
            ? `No mess bill was found for **${requestedMonth}**.`
            : `No mess bill record was found.`;

        if (latestRecordedBill) {
            msg += ` Your latest available bill is for **${latestRecordedBill.month}** with a total of **₹${latestRecordedBill.totalAmount}** (Status: **${latestRecordedBill.status.toUpperCase()}**).`;
        }
        if (allRecordedMonths && allRecordedMonths.length > 0) {
            msg += ` Available months: ${allRecordedMonths.join(", ")}.`;
        } else {
            msg += ` No bills have been uploaded by the mess admin yet.`;
        }
        return msg;
    }

    // If bill is found for selected/latest month:
    const { month, totalAmount, status, breakdown, daysCount, recentDays } = currentBill;

    // 7. Breakfast specific
    if (/breakfast/i.test(q)) {
        return `🍳 In **${month}**, your total breakfast cost is **₹${breakdown.breakfast}** (${breakdown.breakfastDays} days attended).`;
    }

    // 8. Lunch specific
    if (/lunch/i.test(q)) {
        return `🍛 In **${month}**, your total lunch cost is **₹${breakdown.lunch}** (${breakdown.lunchDays} days attended).`;
    }

    // 9. Dinner specific
    if (/dinner/i.test(q)) {
        return `🍽️ In **${month}**, your total dinner cost is **₹${breakdown.dinner}** (${breakdown.dinnerDays} days attended).`;
    }

    // 10. Extras specific
    if (/extra|extras|snack/i.test(q)) {
        return `🥪 In **${month}**, you spent **₹${breakdown.extras}** on mess extras (${breakdown.extrasDays} days).`;
    }

    // 11. Meal breakdown / summary / split
    if (/breakdown|split|meals|detail|summary/i.test(q)) {
        return `Here is your meal breakdown for **${month}** (Total: **₹${totalAmount}**):\n` +
            `• 🍳 Breakfast: ₹${breakdown.breakfast} (${breakdown.breakfastDays} days)\n` +
            `• 🍛 Lunch: ₹${breakdown.lunch} (${breakdown.lunchDays} days)\n` +
            `• 🍽️ Dinner: ₹${breakdown.dinner} (${breakdown.dinnerDays} days)\n` +
            `• 🥪 Extras: ₹${breakdown.extras} (${breakdown.extrasDays} days)\n` +
            `• 📅 Total Recorded Days: ${daysCount}\n` +
            `• 💳 Status: ${status.toUpperCase()}`;
    }

    // 12. Meal history / daily records
    if (/history|days|dates|daily|records|recent/i.test(q)) {
        if (!recentDays || recentDays.length === 0) {
            return `In **${month}**, there are no daily meal records entered yet. Total bill: ₹${totalAmount}.`;
        }
        const daysText = recentDays
            .map(d => `• ${d.date}: Breakfast ₹${d.breakfast}, Lunch ₹${d.lunch}, Dinner ₹${d.dinner}, Extras ₹${d.extras} (Total: ₹${d.total})`)
            .join("\n");
        return `In **${month}**, you have **${daysCount}** recorded days. Here are recent daily entries:\n${daysText}`;
    }

    // 13. Payment status
    if (/paid|payment|status|clear|pending/i.test(q)) {
        if (status === "paid") {
            return `✅ Your mess bill for **${month}** (₹${totalAmount}) is **Paid**.`;
        } else {
            return `⚠️ Your mess bill for **${month}** is **Unpaid**. Total amount due: **₹${totalAmount}**. Please clear it with the mess admin.`;
        }
    }

    // 14. Total bill amount
    if (/total bill|how much|amount|bill amount|what is my bill|bill cost|bill for this month|my bill/i.test(q)) {
        const statusEmoji = status === "paid" ? "✅ Paid" : "⚠️ Unpaid";
        return `Your total mess bill for **${month}** is **₹${totalAmount}** (${statusEmoji}), covering ${daysCount} recorded day(s) of meals.`;
    }

    // 15. Default response with key billing facts
    return `For **${month}**, your total bill is **₹${totalAmount}** (Status: **${status.toUpperCase()}**).\n` +
        `You can ask me:\n` +
        `• 'Is my bill paid?'\n` +
        `• 'Show meal breakdown' (breakfast, lunch, dinner, extras)\n` +
        `• 'Show recent meal history'\n` +
        `• 'Show all my bills'`;
};

export const askChatbot = async (req, res) => {
    let stage = "validation";

    try {
        const { message, month, history = [] } = req.body;

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        const question = message.trim();

        // Validate month if provided
        const cleanMonth = (typeof month === "string" && month.trim()) ? month.trim() : null;
        if (cleanMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(cleanMonth)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid billing month (YYYY-MM)."
            });
        }

        // Validate and clean chat history
        const recentHistory = Array.isArray(history)
            ? history
                .filter((entry) =>
                    entry !== null &&
                    typeof entry === "object" &&
                    (entry?.role === "user" || entry?.role === "assistant") &&
                    typeof entry.content === "string" &&
                    entry.content.trim()
                )
                .slice(-10)
                .map(({ role, content }) => ({
                    role,
                    content: content.trim().slice(0, 2000)
                }))
            : [];

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User ID not found."
            });
        }

        stage = "billing lookup";
        // Fetch all bills for the user to provide complete context
        const allBills = await messBill.find({ user: userId }).sort({ month: -1 }).lean();

        let bill = null;
        if (cleanMonth) {
            bill = allBills.find(b => b.month === cleanMonth) || null;
        } else if (allBills.length > 0) {
            bill = allBills[0];
        }

        // Calculate detailed meal breakdown metrics
        const breakdown = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
            extras: 0,
            daysCount: 0,
            breakfastDays: 0,
            lunchDays: 0,
            dinnerDays: 0,
            extrasDays: 0,
        };

        if (bill && Array.isArray(bill.days)) {
            breakdown.daysCount = bill.days.length;
            for (const d of bill.days) {
                const b = Number(d.breakfast) || 0;
                const l = Number(d.lunch) || 0;
                const dn = Number(d.dinner) || 0;
                const ex = Number(d.extras) || 0;

                breakdown.breakfast += b;
                breakdown.lunch += l;
                breakdown.dinner += dn;
                breakdown.extras += ex;

                if (b > 0) breakdown.breakfastDays++;
                if (l > 0) breakdown.lunchDays++;
                if (dn > 0) breakdown.dinnerDays++;
                if (ex > 0) breakdown.extrasDays++;
            }
        }

        const unpaidBills = allBills.filter(b => b.status === "unpaid");
        const totalUnpaidDues = unpaidBills.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

        const billingContext = {
            requestedMonth: cleanMonth,
            found: Boolean(bill),
            currentBill: bill ? {
                month: bill.month,
                totalAmount: bill.totalAmount,
                status: bill.status,
                daysCount: breakdown.daysCount,
                breakdown,
                recentDays: (bill.days || []).slice(-7).map(d => ({
                    date: d.date ? new Date(d.date).toISOString().slice(0, 10) : "",
                    breakfast: d.breakfast || 0,
                    lunch: d.lunch || 0,
                    dinner: d.dinner || 0,
                    extras: d.extras || 0,
                    total: d.total || 0,
                }))
            } : null,
            latestRecordedBill: allBills[0] ? {
                month: allBills[0].month,
                totalAmount: allBills[0].totalAmount,
                status: allBills[0].status
            } : null,
            allRecordedMonths: allBills.map(b => b.month),
            totalUnpaidDues
        };

        stage = "AI response";
        let answer = null;

        // Try OpenAI Chat Completions API if client is available
        if (openai && process.env.OPENAI_API_KEY) {
            try {
                const systemPrompt = `You are an AI Mess Assistant for a college mess billing system.
You answer students' questions about their mess bills, meal breakdown, payment status, and meal history in simple, friendly, and helpful language.

Current student billing context:
${JSON.stringify(billingContext, null, 2)}

Rules:
1. The billing context above is your sole source of truth. Never invent bill amounts, payment status, dates, or meal numbers.
2. If the selected month has no bill recorded, clearly inform the student and mention their latest or available recorded months.
3. Be concise and polite. Use ₹ currency symbol for amounts.
4. If asked to modify payments or bills, explain that only the mess administrator can update bills or mark them paid.
5. Answer follow-up questions naturally based on recent conversation.`;

                const messages = [
                    { role: "system", content: systemPrompt },
                    ...recentHistory,
                    { role: "user", content: question }
                ];

                const completion = await openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
                    messages,
                    temperature: 0.3,
                    max_tokens: 500
                });

                answer = completion.choices?.[0]?.message?.content?.trim();
            } catch (openAiError) {
                console.warn("OpenAI API call failed, falling back to local billing assistant:", {
                    status: openAiError?.status,
                    code: openAiError?.code,
                    message: openAiError?.message
                });
            }
        }

        // Fallback to local billing engine if OpenAI was not available or failed
        if (!answer) {
            answer = generateLocalBillingAnswer(question, billingContext);
        }

        return res.status(200).json({
            success: true,
            answer: answer
        });

    } catch (error) {
        console.error("Chatbot request failed:", {
            stage,
            name: error?.name,
            message: error?.message,
            status: error?.status,
            code: error?.code
        });

        if (stage === "billing lookup") {
            return res.status(503).json({
                success: false,
                message: "Could not load your billing information. Please try again."
            });
        }

        return res.status(500).json({
            success: false,
            message: "The AI assistant encountered an error. Please try again."
        });
    }
};

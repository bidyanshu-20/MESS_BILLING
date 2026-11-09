
import openai from "../services/openaiService.js";
import messBill from "../models/messBilling.model.js";

export const askChatbot = async (req, res) => {
    try {
        const { message, month } = req.body;

        // 1. Validate user message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a question."
            });
        }

        // 2. Get authenticated user's ID
        const userId = req.user._id;

        // 3. Find the requested month's bill
        // If month is not provided, fetch the latest bill
        let bill;

        if (month) {
            bill = await messBill.findOne({
                user: userId,
                month: month
            }).lean();
        } else {
            bill = await messBill.findOne({
                user: userId
            })
                .sort({ month: -1 })
                .lean();
        }

        // 4. Prepare billing context
        let billingContext = "No billing record found.";

        if (bill) {
            billingContext = {
                month: bill.month,
                totalAmount: bill.totalAmount,
                paymentStatus: bill.status,
                days: bill.days
            };
        }

        // 5. Define chatbot instructions
        const systemPrompt = `
            You are an AI Mess Assistant for a college mess billing system.

            Your responsibilities:
            - Explain monthly mess bills.
            - Explain payment status.
            - Explain meal history.
            - Answer questions about billing calculations.

            Rules:
            1. Use only the billing information provided to you.
            2. Never invent bill amounts or payment information.
            3. If information is unavailable, clearly say so.
            4. Never reveal another student's information.
            5. Answer in simple and friendly language.
            6. Do not claim to modify payments or billing records.
        `;

        // 6. Send question and context to OpenAI
        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            instructions: systemPrompt,
            input: `
                Student's billing information:
                ${JSON.stringify(billingContext)}

                Student's question:
                ${message}
            `
        });

        // 7. Extract AI response
        const answer = response.output_text;

        // 8. Send response to frontend
        return res.status(200).json({
            success: true,
            answer: answer
        });

    } catch (error) {
        console.error("Chatbot Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong with the AI assistant."
        });
    }
};
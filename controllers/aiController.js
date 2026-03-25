const userModel = require("../models/userModel");
const buildAssistantContext = require("../utils/ai/buildAssistantContext");
const { generateAssistantReply, DEFAULT_MODEL } = require("../services/aiService");
const { normalizeRole } = require("../utils/organization");

const askAssistantController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const message = req.body.message?.trim();

    if (!message) {
      return res.status(400).send({
        success: false,
        message: "Message is required",
      });
    }

    const role = normalizeRole(user.role);
    const context = await buildAssistantContext(user);
    const result = await generateAssistantReply({
      role,
      question: message,
      context,
      history: req.body.history,
    });

    return res.status(200).send({
      success: true,
      reply: result.reply,
      model: result.model || DEFAULT_MODEL,
      role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message:
        error.message === "GEMINI_API_KEY is not configured"
          ? "Gemini API key is not configured on the server"
          : error?.message || "Error while generating assistant reply",
      error,
    });
  }
};

module.exports = {
  askAssistantController,
};

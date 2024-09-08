const { Router } = require("express");
const { getGeminiToken, protectGemini, sendMessageToGemini, getAllRooms, getMessagesByRoom } = require("../controllers/geminiController");

const router = Router();

router.post("/get-gemini-token", getGeminiToken);

router.post("/send-message", protectGemini, sendMessageToGemini);

router.get("/get-all-rooms", protectGemini, getAllRooms);

router.get("/get-all-messages/:roomNumber", getMessagesByRoom);

module.exports = router;

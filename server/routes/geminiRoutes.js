const { Router } = require("express");
const { getGeminiToken, protectGemini, sendMessageToGemini, getAllRooms, getMessagesByRoom, testSendMessage } = require("../controllers/geminiController");

const router = Router();

router.post("/get-gemini-token", getGeminiToken);

router.post("/send-message", protectGemini, sendMessageToGemini);

router.post("/test", protectGemini, testSendMessage)

router.get("/get-all-rooms", protectGemini, getAllRooms);

router.get("/get-all-messages/:roomNumber", getMessagesByRoom);

module.exports = router;

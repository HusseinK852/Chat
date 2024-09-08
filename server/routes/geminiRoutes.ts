import { Router } from "express";
import { getGeminiToken, protectGemini, sendMessageToGemini, getAllRooms, getMessagesByRoom } from "../controllers/geminiController";

const router = Router();

router.post("/get-gemini-token", getGeminiToken);

router.post("/send-message", protectGemini, sendMessageToGemini);

router.get("/get-all-rooms", protectGemini, getAllRooms)

router.get("/get-all-messages/:roomNumber", getMessagesByRoom)

export default router;

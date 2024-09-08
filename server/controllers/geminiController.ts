import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import Messages from "../models/messagesModel"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "90d";
const JWT_COOKIE_EXPIRES_IN = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;

interface CustomRequest extends Request {
  geminiApiKey?: string;
  roomNumber?: number;
}

const generateRoomNumber = async (): Promise<number> => {
  let roomNumber: number | undefined;
  let isUnique = false;

  while (!isUnique) {
    roomNumber = parseInt(crypto.randomBytes(3).toString("hex"), 16);
    const existingRoom = await Messages.findOne({ roomNumber: roomNumber });
    if (!existingRoom) {
      isUnique = true;
    }
  }

  if (!roomNumber) {
    throw new AppError("Failed to generate room number", 500);
  }

  return roomNumber;
};


export const getGeminiToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { geminiApiKey } = req.body;

    if (!geminiApiKey) {
      return next(new AppError("GEMINI_API_KEY is required", 400));
    }

    const token = jwt.sign({ geminiApiKey }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const cookieOptions: {
      expires: Date;
      httpOnly: boolean;
      sameSite: "lax";
      secure?: boolean;
    } = {
      expires: new Date(
        Date.now() + JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      sameSite: "lax",
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("geminiApiKey", token, cookieOptions);

    res.status(200).json({
      status: "success",
      token,
    });
  }
);

export const protectGemini = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("GEMINI_API_KEY must be entered", 401));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { geminiApiKey: string };
      req.geminiApiKey = decoded.geminiApiKey;
      next();
    } catch (err) {
      return next(new AppError("Invalid token", 401));
    }
  }
);

export const sendMessageToGemini = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const prompt = req.body.message;
    const geminiApiKey = req.geminiApiKey;
    
    let roomNumber: Number;

    console.log(req.body.roomNumber)
    if (req.body.roomNumber) {
      roomNumber = req.body.roomNumber
    } else {
      roomNumber = await generateRoomNumber();
    }

    console.log(roomNumber)

    if (!geminiApiKey) {
      return next(new AppError("GEMINI_API_KEY is missing", 400));
    }

    if (!prompt) {
      return next(new AppError("Message is required", 400));
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(prompt);

      if (!result || !result.response) {
        return next(new AppError("Failed to get a response from Gemini", 500));
      }

      const assistantReply = result.response.text();

      if (typeof assistantReply !== "string") {
        return next(
          new AppError("Unexpected response format from Gemini", 500)
        );
      }

      await Messages.create({
        token: geminiApiKey,
        sender: "user",
        message: prompt,
        roomNumber: roomNumber,
      });

      await Messages.create({
        token: geminiApiKey,
        sender: "ai",
        message: assistantReply,
        roomNumber: roomNumber,
      });

      res.status(200).json({
        status: "success",
        message: assistantReply,
        roomNumber: roomNumber,
      });
    } catch (err) {
      return next(new AppError("Failed to process Gemini response", 500));
    }
  }
);

export const getAllRooms = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const geminiApiKey = req.geminiApiKey;

    if (!geminiApiKey) {
      return next(new AppError("GEMINI_API_KEY is required", 400));
    }

    const rooms = await Messages.aggregate([
      {
        $match: { token: geminiApiKey }
      },
      {
        $sort: { createdAt: 1 }
      },
      {
        $group: {
          _id: "$roomNumber",
          firstMessage: { $first: "$$ROOT" }
        }
      },
      {
        $project: {
          roomNumber: "$_id",
          firstMessage: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      rooms,
    });
  }
);

export const getMessagesByRoom = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const roomNumber = req.params.roomNumber;

    if (!roomNumber) {
      return next(new AppError("Invalid room number", 400));
    }

    console.log(`Room Number: ${roomNumber}`);

    const messages = await Messages.find({ roomNumber }).sort({ createdAt: 1 });

    if (!messages || messages.length === 0) {
      return next(new AppError("No messages found for this room", 404));
    }

    res.status(200).json({
      status: "success",
      messages,
    });
  }
);


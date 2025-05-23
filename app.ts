require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { rateLimit } from 'express-rate-limit'

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
// origin: process.env.ORIGIN,
app.use(
    cors({
        origin: ['http://localhost:3000', "https://elearninglms.netlify.app"],
        credentials: true,
    })
);
// app.use(cors({ origin: process.env.ORIGIN, credentials: true, }))

// api requests limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.',
        });
    }
})

// routes
app.use(
    "/api/v1",
    userRouter,
    orderRouter,
    courseRouter,
    notificationRouter,
    analyticsRouter,
    layoutRouter
);

// testing api
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({
            success: true,
            message: "API is working",
        });
    } catch (error) {
        next(error);
    }
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);

// Add error handling middleware for express
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Express error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

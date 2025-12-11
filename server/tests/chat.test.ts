import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import chatRouter from "../routes/chat";
import User from "../models/User";
import Message from "../models/Message";

let mongoServer: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
    process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

    app = express();
    app.use(express.json());
    app.use("/api/chat", chatRouter);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
    await Message.deleteMany({});
});

test("GET /api/chat/admin is protected and returns admin when authenticated", async () => {
    // create admin
    const admin = await User.create({
        name: "ChatAdmin",
        email: "chatadmin@test.com",
        password: "Admin123!",
        role: "admin",
    });
    const user = await User.create({
        name: "Normal",
        email: "normal@test.com",
        password: "User123!",
        role: "user",
    });

    const tokenUser = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRE as any,
    });

    // without token -> 401
    const noToken = await request(app).get("/api/chat/admin");
    expect(noToken.statusCode).toBe(401);

    const res = await request(app)
        .get("/api/chat/admin")
        .set("Authorization", `Bearer ${tokenUser}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.admin).toBeDefined();
    expect(res.body.admin.role).toBe("admin");
});

test("GET /api/chat/messages/:conversationId returns messages for conversation", async () => {
    const userA = await User.create({
        name: "A",
        email: "a@test.com",
        password: "Pass123!",
        role: "user",
    });
    const userB = await User.create({
        name: "B",
        email: "b@test.com",
        password: "Pass123!",
        role: "user",
    });

    const conversationId = [userA._id.toString(), userB._id.toString()]
        .sort()
        .join("_");

    await Message.create({
        conversationId,
        sender: userA._id,
        receiver: userB._id,
        content: "Hello",
    });

    const tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRE as any,
    });

    const res = await request(app)
        .get(`/api/chat/messages/${userB._id}`)
        .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.messages.length).toBe(1);
    expect(res.body.messages[0].content).toBe("Hello");
});

test("GET /api/chat/conversations returns conversation summaries", async () => {
    const user1 = await User.create({
        name: "U1",
        email: "u1@test.com",
        password: "Pass123!",
        role: "user",
    });
    const user2 = await User.create({
        name: "U2",
        email: "u2@test.com",
        password: "Pass123!",
        role: "user",
    });

    const convId = [user1._id.toString(), user2._id.toString()].sort().join("_");
    await Message.create({
        conversationId: convId,
        sender: user1._id,
        receiver: user2._id,
        content: "Hi",
    });

    const token1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRE as any,
    });

    const res = await request(app)
        .get("/api/chat/conversations")
        .set("Authorization", `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
});

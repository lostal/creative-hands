import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express, { Express } from "express";
import authRouter from "../routes/auth";
import User from "../models/User";

let mongoServer: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Ensure env for JWT
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
    process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1d";

    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

test("register and login flow", async () => {
    const newUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    };

    const resReg = await request(app).post("/api/auth/register").send(newUser);
    expect(resReg.statusCode).toBe(201);
    expect(resReg.body.success).toBe(true);
    expect(resReg.body.token).toBeDefined();
    expect(resReg.body.user).toBeDefined();
    expect(resReg.body.user.email).toBe(newUser.email);

    const resLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: newUser.email, password: newUser.password });
    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body.success).toBe(true);
    expect(resLogin.body.token).toBeDefined();
    expect(resLogin.body.user).toBeDefined();
    expect(resLogin.body.user.email).toBe(newUser.email);
});

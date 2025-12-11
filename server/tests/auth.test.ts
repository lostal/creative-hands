import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
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
  app.use(cookieParser());
  app.use("/api/auth", authRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

/**
 * Helper para extraer cookie de la respuesta
 */
const getTokenFromCookie = (res: request.Response): string | undefined => {
  const cookies = res.headers["set-cookie"];
  if (!cookies) return undefined;

  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

  for (const cookie of cookieArray) {
    if (cookie.startsWith("token=")) {
      const tokenPart = cookie.split(";")[0];
      return tokenPart.replace("token=", "");
    }
  }
  return undefined;
};

test("register and login flow", async () => {
  const newUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  const resReg = await request(app).post("/api/auth/register").send(newUser);
  expect(resReg.statusCode).toBe(201);
  expect(resReg.body.success).toBe(true);
  // Token ahora viene en cookie httpOnly, no en body
  const regToken = getTokenFromCookie(resReg);
  expect(regToken).toBeDefined();
  expect(resReg.body.user).toBeDefined();
  expect(resReg.body.user.email).toBe(newUser.email);

  const resLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: newUser.email, password: newUser.password });
  expect(resLogin.statusCode).toBe(200);
  expect(resLogin.body.success).toBe(true);
  // Token ahora viene en cookie httpOnly, no en body
  const loginToken = getTokenFromCookie(resLogin);
  expect(loginToken).toBeDefined();
  expect(resLogin.body.user).toBeDefined();
  expect(resLogin.body.user.email).toBe(newUser.email);
});

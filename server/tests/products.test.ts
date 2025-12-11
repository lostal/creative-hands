import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import productRouter from "../routes/products";
import User from "../models/User";
import Product from "../models/Product";
import { getJwtExpire } from "./helpers/types";

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
    app.use("/api/products", productRouter);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // limpiar usuarios y productos
    await User.deleteMany({});
    await Product.deleteMany({});
});

test("admin can create product", async () => {
    // crear admin
    const admin = await User.create({
        name: "Admin",
        email: "admin@test.com",
        password: "Admin123!",
        role: "admin",
    });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const productPayload = {
        name: "Test Product",
        description: "A product for testing",
        price: 9.99,
    };

    const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(productPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.name).toBe(productPayload.name);
    expect(res.body.product.createdBy).toBeDefined();
});

test("unauthenticated cannot create product", async () => {
    const productPayload = { name: "NoAuth", description: "x", price: 1 };
    const res = await request(app).post("/api/products").send(productPayload);
    expect(res.statusCode).toBe(401);
});

test("non-admin cannot create product (403)", async () => {
    const user = await User.create({
        name: "User",
        email: "user@test.com",
        password: "User123!",
        role: "user",
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const productPayload = { name: "UserProduct", description: "x", price: 2 };
    const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(productPayload);
    expect(res.statusCode).toBe(403);
});

test("admin can update and delete product", async () => {
    const admin = await User.create({
        name: "Admin2",
        email: "admin2@test.com",
        password: "Admin123!",
        role: "admin",
    });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const productPayload = { name: "ToUpdate", description: "x", price: 5 };
    const createRes = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(productPayload);
    expect(createRes.statusCode).toBe(201);
    const prodId = createRes.body.product._id;

    // update
    const updateRes = await request(app)
        .put(`/api/products/${prodId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated" });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.product.name).toBe("Updated");

    // delete
    const delRes = await request(app)
        .delete(`/api/products/${prodId}`)
        .set("Authorization", `Bearer ${token}`);
    expect(delRes.statusCode).toBe(200);

    // ensure not present
    const listRes = await request(app).get("/api/products");
    const found = listRes.body.products.find((p: { _id: string }) => p._id === prodId);
    expect(found).toBeUndefined();
});

test("GET /api/products is public and returns products", async () => {
    // create admin + product
    const admin = await User.create({
        name: "Admin3",
        email: "admin3@test.com",
        password: "Admin123!",
        role: "admin",
    });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });
    const productPayload = {
        name: "PublicProduct",
        description: "pub",
        price: 3,
    };
    await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(productPayload);

    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
});

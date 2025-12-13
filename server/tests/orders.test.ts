import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import orderRouter from "../routes/orders";
import User from "../models/User";
import Product from "../models/Product";
import Order from "../models/Order";
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
    app.use("/api/orders", orderRouter);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
});

test("user can create order with valid products", async () => {
    // Crear usuario
    const user = await User.create({
        name: "OrderUser",
        email: "orderuser@test.com",
        password: "Password123!",
        role: "user",
    });

    // Crear producto con stock
    const product = await Product.create({
        name: "Test Product for Order",
        description: "A product for testing orders",
        price: 29.99,
        stock: 10,
        createdBy: user._id,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const orderPayload = {
        orderItems: [
            {
                product: product._id.toString(),
                name: product.name,
                quantity: 2,
                price: product.price,
            },
        ],
        shippingAddress: {
            address: "Calle Test 123",
            city: "Madrid",
            postalCode: "28001",
            phone: "612345678",
        },
    };

    const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(orderPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.totalPrice).toBe(29.99 * 2);

    // Verificar que el stock se redujo
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct?.stock).toBe(8);
});

test("user can get their own orders", async () => {
    const user = await User.create({
        name: "MyOrdersUser",
        email: "myorders@test.com",
        password: "Password123!",
        role: "user",
    });

    const product = await Product.create({
        name: "Product for MyOrders",
        description: "A test product for my orders",
        price: 15.0,
        stock: 5,
        createdBy: user._id,
    });

    // Crear una orden directamente
    await Order.create({
        user: user._id,
        orderItems: [
            {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
            },
        ],
        shippingAddress: {
            address: "Test Address",
            city: "Barcelona",
            postalCode: "08001",
            phone: "600000000",
        },
        totalPrice: 15.0,
        paymentMethod: "Contrarreembolso",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const res = await request(app)
        .get("/api/orders/myorders")
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders.length).toBe(1);
});

test("admin can get all orders", async () => {
    const admin = await User.create({
        name: "OrderAdmin",
        email: "orderadmin@test.com",
        password: "Admin123!",
        role: "admin",
    });

    const user = await User.create({
        name: "RegularUser",
        email: "regular@test.com",
        password: "User123!",
        role: "user",
    });

    const product = await Product.create({
        name: "Admin Test Product",
        description: "Product for admin orders test",
        price: 50.0,
        stock: 20,
        createdBy: admin._id,
    });

    // Crear orden de usuario normal
    await Order.create({
        user: user._id,
        orderItems: [
            {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
            },
        ],
        shippingAddress: {
            address: "User Address",
            city: "Valencia",
            postalCode: "46001",
            phone: "611111111",
        },
        totalPrice: 50.0,
        paymentMethod: "Contrarreembolso",
    });

    const adminToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET as string,
        { expiresIn: getJwtExpire() }
    );

    const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.orders.length).toBeGreaterThanOrEqual(1);
});

test("admin can mark order as delivered", async () => {
    const admin = await User.create({
        name: "DeliverAdmin",
        email: "deliveradmin@test.com",
        password: "Admin123!",
        role: "admin",
    });

    const user = await User.create({
        name: "DeliverUser",
        email: "deliveruser@test.com",
        password: "User123!",
        role: "user",
    });

    const product = await Product.create({
        name: "Deliver Test Product",
        description: "Product for delivery test",
        price: 25.0,
        stock: 10,
        createdBy: admin._id,
    });

    const order = await Order.create({
        user: user._id,
        orderItems: [
            {
                product: product._id,
                name: product.name,
                quantity: 1,
                price: product.price,
            },
        ],
        shippingAddress: {
            address: "Delivery Address",
            city: "Sevilla",
            postalCode: "41001",
            phone: "622222222",
        },
        totalPrice: 25.0,
        paymentMethod: "Contrarreembolso",
        isDelivered: false,
    });

    const adminToken = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET as string,
        { expiresIn: getJwtExpire() }
    );

    const res = await request(app)
        .put(`/api/orders/${order._id}/deliver`)
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.order.isDelivered).toBe(true);
});

test("non-admin cannot get all orders (403)", async () => {
    const user = await User.create({
        name: "NonAdmin",
        email: "nonadmin@test.com",
        password: "User123!",
        role: "user",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: getJwtExpire(),
    });

    const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
});

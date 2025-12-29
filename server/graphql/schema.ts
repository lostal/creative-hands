/**
 * GraphQL Schema - TypeDefs
 * Define los tipos, queries y mutations para la API GraphQL
 */
export const typeDefs = `#graphql
  # ==================== TIPOS ====================

  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
    isOnline: Boolean
    createdAt: String
  }

  type Category {
    _id: ID!
    name: String!
    slug: String!
    description: String
    image: String
  }

  type Review {
    _id: ID!
    user: User
    title: String!
    comment: String!
    rating: Int!
    createdAt: String
  }

  type ProductDimensions {
    height: Float
    width: Float
    depth: Float
    unit: String
  }

  type ProductWeight {
    value: Float
    unit: String
  }

  type Product {
    _id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    images: [String!]!
    categoryId: Category
    materials: [String]
    dimensions: ProductDimensions
    weight: ProductWeight
    reviews: [Review]
    createdBy: User
    createdAt: String
    updatedAt: String
  }

  type ShippingAddress {
    address: String!
    city: String!
    postalCode: String!
    phone: String!
  }

  type OrderItem {
    _id: ID
    name: String!
    quantity: Int!
    price: Float!
    product: Product
  }

  type Order {
    _id: ID!
    user: User
    orderItems: [OrderItem!]!
    shippingAddress: ShippingAddress!
    paymentMethod: String!
    totalPrice: Float!
    status: String!
    createdAt: String
    updatedAt: String
  }

  # ==================== INPUTS ====================

  input OrderItemInput {
    product: ID!
    name: String!
    quantity: Int!
    price: Float!
  }

  input ShippingAddressInput {
    address: String!
    city: String!
    postalCode: String!
    phone: String!
  }

  input CreateOrderInput {
    orderItems: [OrderItemInput!]!
    shippingAddress: ShippingAddressInput!
  }

  # ==================== QUERIES ====================

  type Query {
    # Productos
    products: [Product!]!
    product(id: ID!): Product

    # Pedidos (requieren autenticación)
    orders: [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
  }

  # ==================== MUTATIONS ====================

  type Mutation {
    # Pedidos
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
  }
`;

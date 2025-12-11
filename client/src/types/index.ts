export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    token?: string;
    avatar?: string;
}

export interface Review {
    _id: string;
    user: string | User;
    name: string;
    rating: number;
    comment: string;
    title?: string;
    createdAt: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    countInStock: number;
    imageUrl: string;
    images?: string[];
    category: string | Category;
    rating?: number;
    numReviews?: number;
    reviews?: Review[];
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrderItem {
    name: string;
    quantity: number;
    image: string;
    price: number;
    product: string | Product;
    _id?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export interface Order {
    _id: string;
    user: string | User;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
    products?: T; // Sometimes specific keys are used
    categories?: T;
    orders?: T;
    product?: T;
    category?: T;
    order?: T;
    page?: number;
    pages?: number;
}

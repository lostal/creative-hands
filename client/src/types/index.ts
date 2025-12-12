export interface User {
  _id: string;
  /** Alias para compatibilidad - algunos endpoints devuelven 'id' en lugar de '_id' */
  id?: string;
  name: string;
  email: string;
  role: "admin" | "user";
  token?: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  /** Alias para compatibilidad - algunos endpoints devuelven 'id' en lugar de '_id' */
  id?: string;
  user: string | User;
  name: string;
  rating: number;
  comment: string;
  title: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  /** Stock disponible del producto */
  stock: number;
  /** Array de URLs de imágenes del producto */
  images: string[];
  /** Categoría del producto (puede venir populada o como ID) */
  category?: string | Category;
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
  materials?: string[];
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
  /** @deprecated No usado en el backend actual */
  country?: string;
  phone: string;
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

/**
 * Respuesta estándar de la API
 * Usa genéricos estrictos - el campo 'data' contiene el payload tipado
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  page: number;
  pages: number;
  message?: string;
}

/**
 * Respuestas específicas del backend (formato legacy)
 *
 * PLAN DE MIGRACIÓN:
 * 1. Nuevos endpoints deben usar ApiResponse<T> con campo 'data'
 * 2. Endpoints existentes mantienen formato actual por compatibilidad
 * 3. Frontend debe soportar ambos formatos durante transición
 * 4. Usar helpers de tipado para normalizar respuestas cuando sea posible
 */
export interface ProductsResponse {
  success: boolean;
  products: Product[];
  count?: number;
  page?: number;
  pages?: number;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { CartItem, Product } from "../types";
import logger from "../utils/logger";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * NOTA DE ARQUITECTURA:
 * El carrito actualmente solo persiste en localStorage (cliente).
 * Para escalabilidad futura, considerar:
 * 1. Sincronizar carrito con backend para usuarios autenticados
 * 2. Usar localStorage como caché/fallback para offline
 * 3. Validar precios del servidor antes de crear orden (ya implementado en orderController)
 */

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        logger.error("Error al cargar carrito:", error);
        setCartItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Guardar carrito en localStorage cuando cambie (solo después de inicializar)
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems, isInitialized]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    // Validar stock disponible
    if (product.stock <= 0) {
      logger.warn(`Producto ${product.name} sin stock disponible`);
      return false;
    }

    setCartItems((prevItems) => {
      // Buscar si el producto ya existe en el carrito
      const existingItem = prevItems.find(
        (item) => item.product._id === product._id,
      );

      if (existingItem) {
        // Verificar que no exceda el stock disponible
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          logger.warn(
            `Stock insuficiente para ${product.name}. Máximo: ${product.stock}`,
          );
          // Ajustar al máximo disponible
          return prevItems.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: product.stock }
              : item,
          );
        }
        // Si existe, incrementar la cantidad
        return prevItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: newQuantity }
            : item,
        );
      } else {
        // Si no existe, agregarlo (respetando stock)
        const safeQuantity = Math.min(quantity, product.stock);
        return [
          ...prevItems,
          {
            product,
            quantity: safeQuantity,
          },
        ];
      }
    });
    return true;
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product._id !== productId),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product._id !== productId),
        );
        return;
      }
      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.product._id === productId) {
            // Validar contra stock disponible
            const safeQuantity = Math.min(newQuantity, item.product.stock);
            return { ...item, quantity: safeQuantity };
          }
          return item;
        }),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((s) => !s), []);

  // Calcular número total de items (memoizado)
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  // Calcular precio total (memoizado)
  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  const value = useMemo<CartContextType>(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      totalItems,
      totalPrice,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      totalItems,
      totalPrice,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

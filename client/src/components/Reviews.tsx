import { useEffect, useState, useRef } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/errors";
import { getUserId, isSameUser } from "../utils/user";
import { Trash2, Edit3 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../lib/motion";

import { Product, Review, User } from "../types";

// Reviews.jsx - componente consolidado para listado, métricas y formulario
interface StarsDisplayProps {
  rating: number;
  size?: string;
}

const StarsDisplay = ({ rating = 0, size = "text-sm" }: StarsDisplayProps) => {
  const r = Math.round((parseFloat(rating.toString()) || 0) * 2) / 2; // media precisión 0.5
  const full = Math.floor(r);
  const half = r - full === 0.5;
  return (
    <div className={`inline-flex items-center gap-1 ${size}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        if (idx <= full)
          return (
            <span key={idx} className="text-yellow-400">
              ★
            </span>
          );
        if (half && idx === full + 1)
          return (
            <span key={idx} className="text-yellow-400">
              ☆
            </span>
          );
        return (
          <span key={idx} className="text-gray-300 dark:text-gray-600">
            ★
          </span>
        );
      })}
    </div>
  );
};

interface ReviewsProps {
  productId: string;
  initialProduct: Product;
  onProductUpdate?: (product: Product) => void;
}

const Reviews = ({
  productId,
  initialProduct,
  onProductUpdate,
}: ReviewsProps) => {
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", comment: "", rating: 5 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setProduct(initialProduct), [initialProduct]);

  const currentUserId = getUserId(user);

  const myReview = (product?.reviews || []).find((r) => {
    if (!r.user || !currentUserId) return false;
    // Caso 1: user es un string (ID sin popular)
    if (typeof r.user === "string") {
      return isSameUser(r.user, currentUserId);
    }
    // Caso 2: user es un objeto populado
    const reviewUser = r.user as User;
    const reviewUserId = reviewUser._id || reviewUser.id;
    return isSameUser(reviewUserId, currentUserId);
  });

  const openFormForNew = () => {
    setError(null);
    setForm({ title: "", comment: "", rating: 5 });
    setEditingId(null);
    setFormVisible(true);
  };

  const openFormForEdit = (rev: Review) => {
    // switch to inline edit mode (overlay) so the card doesn't change height
    setError(null);
    setForm({
      title: rev.title || "",
      comment: rev.comment || "",
      rating: rev.rating || 5,
    });
    setEditingId(rev._id || rev.id || null);
  };

  const submit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!isAuthenticated)
      return setError("Debes iniciar sesión para dejar una opinión");
    if (user?.role === "admin")
      return setError("Los administradores no pueden dejar opiniones");
    if (!form.title.trim() || !form.comment.trim())
      return setError("Rellena título y comentario");

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await api.put(
          `/products/${productId}/reviews/${editingId}`,
          form,
        );
      } else {
        res = await api.post(`/products/${productId}/reviews`, form);
      }

      if (res.data?.product) {
        setProduct(res.data.product);
        if (onProductUpdate) onProductUpdate(res.data.product);
        setForm({ title: "", comment: "", rating: 5 });
        setEditingId(null);
        setFormVisible(false);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (rev: Review) => {
    if (!window.confirm("¿Eliminar tu valoración?")) return;
    try {
      const id = rev._id || rev.id;
      const res = await api.delete(`/products/${productId}/reviews/${id}`);
      if (res.data?.product) {
        setProduct(res.data.product);
        if (onProductUpdate) onProductUpdate(res.data.product);
      }
    } catch (err: unknown) {
      alert(getApiErrorMessage(err));
    }
  };

  // submit when editing inline (overlay)
  const submitInlineEdit = async (e: React.FormEvent) => {
    e && e.preventDefault();
    if (!editingId) return;
    if (!isAuthenticated) return setError("Debes iniciar sesión para editar");
    try {
      setSubmitting(true);
      const res = await api.put(
        `/products/${productId}/reviews/${editingId}`,
        form,
      );
      if (res.data?.product) {
        setProduct(res.data.product);
        onProductUpdate && onProductUpdate(res.data.product);
        setEditingId(null);
        setForm({ title: "", comment: "", rating: 5 });
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Valoraciones
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {product?.numReviews ?? (product?.reviews || []).length} opiniones
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StarsDisplay rating={product?.rating ?? 0} size="text-base" />
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {product?.rating ?? 0}
            </div>
          </div>
          {/* Mostrar botón solo para crear nueva opinión; si ya tienes una opinión, no mostrar el botón superior 'Editar tu opinión' (evita duplicidad) */}
          {isAuthenticated && user?.role !== "admin" && !myReview && (
            <button
              onClick={openFormForNew}
              className="px-3 py-2 bg-primary-500 text-white rounded-sm text-sm"
            >
              Escribir opinión
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {(product?.reviews || []).length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Aún no hay valoraciones.
          </div>
        ) : (
          (product.reviews || [])
            .slice()
            .reverse()
            .map((r) => (
              <article
                key={r._id || r.createdAt}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xs border relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {typeof r.user === "object"
                        ? (r.user as User).name
                        : "Usuario"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <StarsDisplay rating={r.rating} />
                  </div>
                </div>
                <h4 className="mt-3 font-medium text-gray-800 dark:text-gray-100">
                  {r.title}
                </h4>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {r.comment}
                </p>

                {currentUserId &&
                  (typeof r.user === "string"
                    ? isSameUser(r.user, currentUserId)
                    : isSameUser(
                      (r.user as User)?._id || (r.user as User)?.id,
                      currentUserId,
                    )) && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openFormForEdit(r)}
                        className="p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Editar valoración"
                      >
                        <Edit3 className="w-4 h-4 text-primary-500" />
                      </button>
                      <button
                        onClick={() => remove(r)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Eliminar valoración"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}

                {/* Inline edit overlay: aparece sobre la card sin afectar el layout ni estirar la card */}
                <AnimatePresence initial={false}>
                  {editingId === (r._id || r.id) && (
                    <MotionDiv
                      key={`edit-overlay-${r._id || r.id}`}
                      className="absolute inset-0 z-popover flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onMouseDown={(e: React.MouseEvent) => {
                        // click outside the panel closes the inline editor
                        if (e.target === e.currentTarget) {
                          setEditingId(null);
                          setForm({ title: "", comment: "", rating: 5 });
                          setError(null);
                        }
                      }}
                    >
                      <MotionDiv
                        ref={panelRef}
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.14 }}
                        className="w-full max-w-xl bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-4"
                        onMouseDown={(e: React.MouseEvent) =>
                          e.stopPropagation()
                        }
                      >
                        {error && (
                          <div className="text-sm text-red-500 mb-2">
                            {error}
                          </div>
                        )}
                        <form onSubmit={submitInlineEdit} className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                              Título
                            </label>
                            <input
                              value={form.title}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  title: e.target.value,
                                }))
                              }
                              className="mt-1 w-full px-3 py-2 rounded-sm border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                              Comentario
                            </label>
                            <textarea
                              value={form.comment}
                              onChange={(e) =>
                                setForm((s) => ({
                                  ...s,
                                  comment: e.target.value,
                                }))
                              }
                              rows={3}
                              className="mt-1 w-full px-3 py-2 rounded-sm border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div>
                              <label className="text-sm font-medium">
                                Puntuación
                              </label>
                              <div className="mt-1 inline-flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() =>
                                      setForm((s) => ({ ...s, rating: n }))
                                    }
                                    className={`text-2xl ${n <= form.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                      }`}
                                    aria-label={`Puntuar ${n}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="ml-auto flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setForm({
                                    title: "",
                                    comment: "",
                                    rating: 5,
                                  });
                                  setError(null);
                                }}
                                className="px-3 py-2 border rounded-sm text-sm text-gray-700 dark:text-gray-200"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-primary-500 text-white rounded-sm text-sm"
                              >
                                {submitting ? "Guardando…" : "Guardar"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </MotionDiv>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </article>
            ))
        )}
      </div>

      {/* Form area */}
      {formVisible && (
        <div
          id="reviews-form"
          className="mt-5 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
        >
          {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Título
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-sm border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                placeholder="Breve título"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Comentario
              </label>
              <textarea
                value={form.comment}
                onChange={(e) =>
                  setForm((s) => ({ ...s, comment: e.target.value }))
                }
                rows={4}
                className="mt-1 w-full px-3 py-2 rounded-sm border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                placeholder="Cuenta tu experiencia"
              ></textarea>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="text-sm font-medium">Puntuación</label>
                <div className="mt-1 inline-flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, rating: n }))}
                      className={`text-2xl ${n <= form.rating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                        }`}
                      aria-label={`Puntuar ${n}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormVisible(false);
                    setEditingId(null);
                    setForm({ title: "", comment: "", rating: 5 });
                  }}
                  className="px-3 py-2 border rounded-sm text-sm text-gray-700 dark:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-sm text-sm"
                >
                  {submitting ? "Enviando…" : editingId ? "Guardar" : "Enviar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reviews;

import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, toggleCart, updateQuantity, removeFromCart, clearCart } from "../lib/store";

export function CartDrawer() {
  const { isOpen, items } = useCart();
  const navigate = useNavigate();

  const handleClose = () => toggleCart(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Simplified discount logic: 2 Juices for $6 ($3/each if total cost > $6 or something)
  // Or 2 Juices (8oz) for $5.
  // For demo: Let's do straight subtotal here, checkout can calculate complex deals.
  const total = subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col rounded-l-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <h2 className="font-display text-3xl font-bold flex items-center gap-3 relative z-10">
                <ShoppingBag />
                Your Juices
              </h2>
              <button
                onClick={handleClose}
                className="p-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full transition-colors relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCInPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9IiNlN2UzZTIiLz4KPC9zdmc+')]">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                  <ShoppingBag size={64} className="mb-4" />
                  <p className="font-display text-xl">Your cart is thirsty!</p>
                  <button onClick={handleClose} className="mt-4 text-primary underline font-bold">Back to Menu</button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      key={item.cartItemId}
                      className="bg-card p-4 rounded-2xl shadow-sm border border-border flex gap-4 items-center"
                    >
                      <div className="text-4xl bg-secondary/30 p-2 rounded-xl flex items-center justify-center min-w-[64px]">
                        {item.image || (item.type === 'juice' ? '🍹' : item.type === 'hotdog' ? '🌭' : '📦')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                        <p className="text-sm text-muted-foreground font-medium mb-1">
                          {item.size ? `${item.size} • ` : ''}${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.subItems && item.subItems.length > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mt-2 space-y-1 border border-border">
                            {item.subItems.map((sub, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 font-medium">
                                <span>{sub.image}</span>
                                <span>{sub.quantity > 1 ? `${sub.quantity}x ` : ''}{sub.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                          <button
                            onClick={() => item.quantity > 1 ? updateQuantity(item.cartItemId, item.quantity - 1) : removeFromCart(item.cartItemId)}
                            className="bg-background rounded-full p-1 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold font-display w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            className="bg-background rounded-full p-1 shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-card border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-muted-foreground font-bold text-lg">Subtotal</span>
                  <span className="font-display text-4xl font-bold text-foreground">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    handleClose();
                    navigate({ to: "/checkout" });
                  }}
                  className="w-full bg-primary text-primary-foreground font-display text-2xl py-5 rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">Checkout</span>
                  {/* Sweep effect */}
                  <div className="absolute inset-0 h-full w-full bg-white/20 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useCart, clearCart } from "../lib/store";
import { motion } from "framer-motion";
import { useState } from "react";
import { CopyCheck, MapPin, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutComponent,
});

function CheckoutComponent() {
  const { items } = useCart();
  const navigate = useNavigate();
  const [orderComplete, setOrderComplete] = useState(false);

  const hasFood = items.some((i) => i.type === "hotdog");

  const form = useForm({
    defaultValues: {
      orderType: hasFood ? "pickup" : "pickup",
      address: "",
      name: "",
      time: "",
    },
    onSubmit: async ({ value }) => {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      console.log(value);
      setOrderComplete(true);
      clearCart();
    },
  });

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 5.00; // Flat delivery fee
  
  if (orderComplete) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-primary/20 p-8 rounded-full mb-8 relative"
        >
            <div className="absolute inset-0 bg-primary/20 scale-150 rounded-full animate-ping" />
           <CopyCheck size={64} className="text-primary relative z-10" />
        </motion.div>
        <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">You're All Set!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Thanks for your order! It'll be freshly squeezed for you soon.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
        >
          Back Home
        </button>
      </div>
    );
  }

  if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-muted-foreground">
          <p className="font-display text-2xl mb-4">Your cart is empty!</p>
          <button onClick={() => navigate({ to: "/menu" })} className="text-primary underline font-bold">Go to Menu</button>
        </div>
      )
  }

  return (
    <div className="bg-background min-h-[calc(100vh-80px)] py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Form Container */}
        <div className="flex-1">
          <h1 className="font-display text-5xl mb-8">Checkout</h1>
          
          <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              {/* Order Type Selector */}
              <form.Field
                name="orderType"
                validators={{
                    onChange: ({ value }) => {
                        if (value === 'delivery' && hasFood) {
                            return "Delivery is only available for juices, not food items.";
                        }
                    }
                }}
                children={(field) => (
                  <div>
                    <label className="block font-bold text-muted-foreground mb-4 uppercase tracking-wider text-sm">
                      How would you like your order?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => field.handleChange("pickup")}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
                          field.state.value === "pickup"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Store size={32} />
                        <span className="font-bold">Pickup</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                            if (hasFood) {
                                toast.error("Delivery only available for Juices. Please remove Hotdogs from cart to select delivery.");
                                return;
                            }
                            field.handleChange("delivery")
                        }}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all ${
                          field.state.value === "delivery"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <MapPin size={32} />
                        <span className="font-bold">Delivery</span>
                      </button>
                    </div>
                    {field.state.meta.errors ? (
                        <p className="text-destructive mt-2 font-bold">{field.state.meta.errors}</p>
                    ) : null}
                  </div>
                )}
              />

              <div className="grid gap-6">
                 {/* Name Field */}
                <form.Field
                  name="name"
                  validators={{ onChange: ({ value }) => !value ? 'Name is required' : undefined }}
                  children={(field) => (
                    <div>
                      <label className="block font-bold text-muted-foreground mb-2 ml-2 tracking-wide text-sm">Name</label>
                      <input
                        className="w-full bg-card border-none outline-none ring-2 ring-transparent focus:ring-primary text-foreground rounded-2xl p-4 font-bold shadow-sm"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Juice Lover"
                      />
                      {field.state.meta.errors ? <em className="text-destructive font-bold text-sm mt-1">{field.state.meta.errors}</em> : null}
                    </div>
                  )}
                />

                <form.Subscribe
                    selector={(state) => state.values.orderType}
                    children={(orderType) => (
                        orderType === 'delivery' ? (
                        /* Address Field */
                        <form.Field
                          name="address"
                          validators={{ onChange: ({ value }) => !value ? 'Address is required for delivery' : undefined }}
                          children={(field) => (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                              <label className="block font-bold text-muted-foreground mb-2 ml-2 tracking-wide text-sm">Delivery Address</label>
                              <input
                                className="w-full bg-card border-none outline-none ring-2 ring-transparent focus:ring-primary text-foreground rounded-2xl p-4 font-bold shadow-sm"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="123 Citrus Ave"
                              />
                               {field.state.meta.errors ? <em className="text-destructive font-bold text-sm mt-1">{field.state.meta.errors}</em> : null}
                            </motion.div>
                          )}
                        />
                        ) : null
                    )}
                />

                {/* Scheduled Time */}
                <form.Field
                  name="time"
                  validators={{ onChange: ({ value }) => !value ? 'Please select a pickup/delivery time' : undefined }}
                  children={(field) => (
                    <div>
                      <label className="block font-bold text-muted-foreground mb-2 ml-2 tracking-wide text-sm">Scheduled Time</label>
                      <input
                        type="time"
                        className="w-full bg-card border-none outline-none ring-2 ring-transparent focus:ring-primary text-foreground rounded-2xl p-4 font-bold shadow-sm"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors ? <em className="text-destructive font-bold text-sm mt-1">{field.state.meta.errors}</em> : null}
                    </div>
                  )}
                />

              </div>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full bg-primary text-primary-foreground font-display text-2xl py-6 rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </button>
                )}
              />
            </form>
        </div>

        {/* Order Summary */}
        <div className="md:w-80 lg:w-96">
            <div className="bg-card p-6 rounded-3xl border border-border sticky top-24 shadow-xl shadow-black/5">
                <h3 className="font-display text-2xl mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                    {items.map(item => (
                        <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                            <div className="flex-[2]">
                                <p className="font-bold text-foreground">{item.name}</p>
                                <p className="text-muted-foreground">{item.size} x {item.quantity}</p>
                            </div>
                            <span className="font-bold flex-1 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-border pt-4 mb-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>

                    <form.Subscribe
                        selector={(state) => state.values.orderType}
                        children={(orderType) => (
                           orderType === 'delivery' ? (
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                            </div>
                           ) : null
                        )}
                    />
                </div>
                 <form.Subscribe
                        selector={(state) => state.values.orderType}
                        children={(orderType) => {
                            const finalTotal = orderType === 'delivery' ? subtotal + deliveryFee : subtotal;
                            return (
                                <div className="flex justify-between items-end border-t border-border mt-4 pt-4">
                                     <span className="font-bold">Total</span>
                                     <span className="font-display text-4xl text-primary">${finalTotal.toFixed(2)}</span>
                                </div>
                            )
                        }}
                    />
            </div>
        </div>
      </div>
    </div>
  );
}

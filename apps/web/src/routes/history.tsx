import { createFileRoute } from "@tanstack/react-router";
import { CopyCheck, Clock, Package } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/history")({
  component: HistoryComponent,
});

// Dummy order data
const PAST_ORDERS = [
  {
    id: "ORD-9821",
    date: "2026-04-10",
    status: "Delivered",
    type: "delivery",
    total: 15.00,
    items: [
      { name: "Sunshine Orange", quantity: 2, size: "16oz" },
      { name: "Classic Lemonade", quantity: 1, size: "16oz" },
    ]
  },
  {
    id: "ORD-9805",
    date: "2026-04-02",
    status: "Picked Up",
    type: "pickup",
    total: 11.00,
    items: [
      { name: "Classic Hotdog", quantity: 2 },
      { name: "Tropical Pineapple", quantity: 1, size: "8oz" },
    ]
  }
];

function HistoryComponent() {
  return (
    <div className="bg-background min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-5xl mb-8 flex items-center gap-4">
          <Clock className="text-secondary" size={48} />
          Order History
        </h1>

        {PAST_ORDERS.length === 0 ? (
           <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <Package size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="font-display text-2xl text-muted-foreground">No orders yet.</h2>
           </div>
        ) : (
          <div className="space-y-6">
            {PAST_ORDERS.map((order, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={order.id} 
                className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />

                <div className="flex-1 z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-display text-xl text-primary font-bold">${order.total.toFixed(2)}</p>
                       <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                           <CopyCheck size={12} />
                           {order.status}
                       </span>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-2xl">
                     <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-sm flex justify-between font-medium">
                            <span className="text-foreground">
                              {item.quantity}x {item.name} {item.size && <span className="text-muted-foreground">({item.size})</span>}
                            </span>
                          </li>
                        ))}
                     </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getOrders } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Route = createFileRoute("/admin/orders/$orderId")({
  loader: async ({ params }) => {
      const orders = await getOrders();
      const order = orders.find(o => o.id === params.orderId);
      if (!order) throw new Error("Order not found");
      return order;
  },
  component: OrderDetailModal,
});

function OrderDetailModal() {
  const selectedOrder = Route.useLoaderData();
  const navigate = useNavigate();

  const handleClose = () => {
      // Navigate back to orders
      navigate({ to: '/admin/orders' });
  };

  return (
    <AnimatePresence>
      <motion.div 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
         onClick={handleClose}
      >
         <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-card w-full max-w-lg rounded-3xl border-2 border-border shadow-2xl p-8 sticky max-h-[90vh] overflow-y-auto"
         >
           <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
             <div>
               <h3 className="font-display text-3xl font-bold">Receipt</h3>
               <p className="font-bold text-muted-foreground">{selectedOrder.id} • {selectedOrder.date}</p>
             </div>
             <button onClick={handleClose} className="p-2 bg-muted rounded-full hover:bg-border transition-colors">
               <X size={24} />
             </button>
           </div>

           <div className="bg-muted px-4 py-6 rounded-2xl mb-6">
              <div className="flex justify-between font-bold mb-4">
                <span className="text-muted-foreground">Customer</span>
                <span>{selectedOrder.customer}</span>
              </div>
              {selectedOrder.type === 'delivery' && (
                <div className="flex justify-between font-bold mb-4">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right text-accent">{selectedOrder.address || "N/A"}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mb-4">
                <span className="text-muted-foreground">Type</span>
                <span className="uppercase">{selectedOrder.type}</span>
              </div>
              
              <div className="my-6 border-t border-border border-dashed"></div>

              <div className="font-bold text-muted-foreground mb-2">Items</div>
              <div className="font-medium whitespace-pre-line leading-relaxed mb-6">
                {selectedOrder.items.split(',').map((it, i) => <div key={i}>• {it.trim()}</div>)}
              </div>
              
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-border">
                <span>Total</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
           </div>

           <div className="flex justify-center gap-4">
             <button onClick={handleClose} className="bg-foreground text-background font-bold px-8 py-4 rounded-xl border border-border w-full hover:scale-[1.02] active:scale-[0.98] transition-transform">
               Close Receipt
             </button>
           </div>
         </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

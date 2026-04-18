import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getOrders, updateOrderStatus, type AdminOrder } from "../../lib/types";

export const Route = createFileRoute("/admin/deliveries")({
  loader: () => getOrders(),
  component: DeliveriesDashboard,
});

function DeliveriesDashboard() {
  const initialOrders = Route.useLoaderData();
  const [data, setData] = useState(() => initialOrders);

  const deliveryOrders = data.filter(d => d.type === 'delivery' && d.status !== 'delivered');

  const handleStatusChange = async (id: string, newStatus: AdminOrder['status']) => {
      setData(prev => prev.map(order => order.id === id ? { ...order, status: newStatus } : order));
      await updateOrderStatus(id, newStatus);
      if (newStatus === 'ready') toast.success(`Order ${id} is ready! Confetti time! 🎉`);
      if (newStatus === 'out_for_delivery') toast.success(`Order ${id} is out for delivery! 🚚`);
  };

  return (
    <motion.div key="deliveries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <h2 className="font-display text-3xl mb-6">Delivery Operations</h2>
      {deliveryOrders.length === 0 ? (
        <div className="bg-card rounded-3xl border border-border p-12 text-center text-muted-foreground flex flex-col items-center">
            <Truck size={48} className="mb-4 opacity-50" />
            <p className="font-display text-xl drop-shadow-sm">No Pending Deliveries!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {deliveryOrders.map(order => (
            <div key={order.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-md">
              <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center">
                <div className="font-bold font-display text-lg">{order.customer}</div>
                <div className="text-sm font-bold bg-background px-3 py-1 rounded-full border border-border">Order {order.id}</div>
              </div>
              <div className="p-6">
                <div className="font-bold text-muted-foreground mb-1 text-sm uppercase">Delivery Address</div>
                <div className="font-bold text-xl mb-4 text-foreground break-words">{order.address || "No address provided"}</div>
                <div className="font-bold text-muted-foreground mb-1 text-sm uppercase">Items</div>
                <div className="font-medium text-foreground mb-6">{order.items}</div>
                
                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-4 py-3 rounded-xl transition-colors"
                    >
                      Dispatch Driver 🚚
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-xl transition-colors"
                    >
                      Mark Delivered ✅
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'preparing') && (
                    <button 
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 py-3 rounded-xl transition-colors"
                    >
                      Mark Ready for Driver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ShieldCheck, Database, ClipboardList, Package, Truck, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { resetDb } from "../lib/types";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const handleReset = async () => {
    await resetDb();
    toast.success("Database restored to factory defaults and refreshed!");
    window.location.reload(); // Simple brute force update for demo DB
  };

  return (
    <div className="bg-background min-h-screen py-8 px-4 md:px-6 mb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="font-display text-4xl flex items-center gap-3">
            <ShieldCheck className="text-secondary" size={40} />
            Owner Portal
          </h1>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 bg-card border-2 border-border text-foreground font-bold px-4 py-2 rounded-xl hover:border-primary transition-colors hover:shadow-sm"
          >
            <Database size={18} />
            Reset Data
          </button>
        </div>

        {/* Tabs - Now utilizing actual Router Links */}
        <div className="flex overflow-x-auto gap-2 mb-8 bg-muted/50 p-2 rounded-2xl border border-border">
          <Link 
            to="/admin/orders"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-primary text-primary-foreground shadow-md pointer-events-none hover:bg-primary" }}
          >
            <ClipboardList size={20} /> Orders
          </Link>
          <Link 
            to="/admin/products"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-accent text-accent-foreground shadow-md pointer-events-none hover:bg-accent" }}
          >
            <Package size={20} /> Products
          </Link>
          <Link 
            to="/admin/deliveries"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-foreground text-background shadow-md pointer-events-none hover:bg-foreground" }}
          >
            <Truck size={20} /> Delivery Dashboard
          </Link>
        </div>

        {/* Nested Page Content renders here */}
        <Outlet />
      </div>
    </div>
  );
}

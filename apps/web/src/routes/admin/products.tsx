import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getProducts, type Product } from "../../lib/types";

export const Route = createFileRoute("/admin/products")({
  loader: () => getProducts(),
  component: ProductsDashboard,
});

function ProductsDashboard() {
  const initialProducts = Route.useLoaderData();
  const [products, setProducts] = useState<Product[]>(() => initialProducts);
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ type: 'juice', image: '🍊', basePrice: 5 });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description) {
      toast.error("Please fill out name and description!");
      return;
    }
    const product: Product = {
      id: `new-${Date.now()}`,
      name: newProduct.name,
      type: newProduct.type as "juice" | "hotdog" | "subscription",
      description: newProduct.description,
      image: newProduct.image || "🥤",
      basePrice: newProduct.basePrice || 5,
    };
    setProducts(prev => [product, ...prev]);
    setShowAddProduct(false);
    setNewProduct({ type: 'juice', image: '🍊', basePrice: 5 });
    toast.success("Product added successfully!");
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success("Product removed.");
  };

  return (
    <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl">Manage Menu</h2>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="bg-primary text-primary-foreground font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {showAddProduct && (
        <div className="bg-muted/50 p-6 rounded-3xl border border-border mb-8 shadow-inner animate-in fade-in zoom-in-95">
           <h3 className="font-display text-2xl mb-4">New Product</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div>
               <label className="text-sm font-bold block mb-1">Name</label>
               <input type="text" className="w-full h-12 px-4 rounded-xl border border-border" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Grapefruit Splash" />
             </div>
             <div>
               <label className="text-sm font-bold block mb-1">Type</label>
               <select className="w-full h-12 px-4 rounded-xl border border-border" value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value as any})}>
                 <option value="juice">Juice</option>
                 <option value="hotdog">Hotdog/Food</option>
                 <option value="subscription">Subscription</option>
               </select>
             </div>
             <div>
               <label className="text-sm font-bold block mb-1">Base Price ($)</label>
               <input type="number" className="w-full h-12 px-4 rounded-xl border border-border" value={newProduct.basePrice} onChange={e => setNewProduct({...newProduct, basePrice: Number(e.target.value)})} />
             </div>
             <div>
               <label className="text-sm font-bold block mb-1">Emoji Icon</label>
               <input type="text" className="w-full h-12 px-4 rounded-xl border border-border" value={newProduct.image || ''} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
             </div>
             <div className="md:col-span-2">
               <label className="text-sm font-bold block mb-1">Description</label>
               <input type="text" className="w-full h-12 px-4 rounded-xl border border-border" value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
             </div>
           </div>
           <div className="flex gap-4">
             <button onClick={handleAddProduct} className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:bg-primary/90">Save Product</button>
             <button onClick={() => setShowAddProduct(false)} className="bg-card text-foreground font-bold px-6 py-3 rounded-xl border border-border">Cancel</button>
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4 h-full">
             <div className="text-5xl">{p.image}</div>
             <div className="flex-1">
               <div className="text-xs font-bold text-muted-foreground uppercase">{p.type}</div>
               <div className="font-display text-xl leading-tight mb-1">{p.name}</div>
               <div className="font-bold text-lg">${p.basePrice?.toFixed(2)}</div>
             </div>
             <button onClick={() => handleDeleteProduct(p.id)} className="text-muted-foreground hover:bg-destructive/10 p-2 rounded-full hover:text-destructive transition-colors self-start">
               <X size={20} />
             </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

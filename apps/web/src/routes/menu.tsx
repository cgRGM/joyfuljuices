import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "../components/ProductCard";
import { getProducts, type Product } from "../lib/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { BundleSelectorModal } from "../components/BundleSelectorModal";

export const Route = createFileRoute("/menu")({
  component: MenuComponent,
  loader: () => getProducts(),
});

function MenuComponent() {
  const products = Route.useLoaderData();
  const [selectedBundle, setSelectedBundle] = useState<any>(null);

  const juices = products.filter((p) => p.type === "juice");
  const food = products.filter((p) => p.type === "hotdog");
  const subs = products.filter((p) => p.type === "subscription");
  const deals = products.filter((p) => p.type === "deal");



  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header section with deals */}
      <div className="bg-secondary/20 py-12 px-6 border-b-4 border-secondary/40">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-5xl md:text-7xl mb-4 text-secondary-foreground drop-shadow-sm">
              Fresh Menu
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-xl mx-auto">
              Squeezed to order! Check out our daily deals and bundles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Deal Cards */}
            <motion.button 
              onClick={() => setSelectedBundle(deals.find(d => d.id === 'dl-1'))}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-xl shadow-primary/20 transform-gpu text-left w-full h-full"
            >
              <div className="text-4xl mb-2">🍹🍹</div>
              <h3 className="font-display text-2xl font-bold mb-2">Double Trouble</h3>
              <p className="font-sans font-medium opacity-90">2 Juices (8oz) for just <span className="text-3xl font-bold bg-white text-primary px-2 rounded-xl">$5</span></p>
            </motion.button>
            
            <motion.button 
              onClick={() => setSelectedBundle(deals.find(d => d.id === 'dl-2'))}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="bg-accent text-accent-foreground p-6 rounded-3xl shadow-xl shadow-accent/20 transform-gpu text-left w-full h-full"
            >
              <div className="text-4xl mb-2">🌭🍹</div>
              <h3 className="font-display text-2xl font-bold mb-2">The Classic Bundle</h3>
              <p className="font-sans font-medium opacity-90">2 Hotdogs + Any 8oz Juice for <span className="text-3xl font-bold bg-white text-accent px-2 rounded-xl">$8</span></p>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-display text-4xl mb-8 flex items-center gap-3">
          <span className="text-primary">Juices</span> 🥤
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {juices.map((product) => (
             <div key={product.id} className="h-full flex flex-col">
              <ProductCard product={product} allProducts={products} />
             </div>
          ))}
        </div>

        <h2 className="font-display text-4xl mt-16 mb-8 flex items-center gap-3">
          <span className="text-accent">Hotdogs & Food</span> 🌭
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {food.map((product) => (
            <div key={product.id} className="h-full flex flex-col">
              <ProductCard product={product} allProducts={products} />
            </div>
          ))}
        </div>

        <h2 className="font-display text-4xl mt-16 mb-8 flex items-center gap-3 text-foreground">
          Subscriptions 🚚
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {subs.map((product) => (
             <div key={product.id} className="h-full flex flex-col">
              <ProductCard product={product} allProducts={products} />
             </div>
          ))}
        </div>

        {selectedBundle && (
            <BundleSelectorModal product={selectedBundle} allProducts={products} onClose={() => setSelectedBundle(null)} />
        )}
      </div>
    </div>
  );
}

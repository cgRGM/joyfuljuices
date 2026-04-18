import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { type Product, type ProductSize, calculateBasePrice } from "../lib/types";
import { addToCart } from "../lib/store";
import { BundleSelectorModal } from "./BundleSelectorModal";

export function ProductCard({ product, allProducts }: { product: Product, allProducts?: Product[] }) {
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product.availableSizes?.[0]
  );
  const [showBundleModal, setShowBundleModal] = useState(false);
  
  const price = calculateBasePrice(product.basePrice, selectedSize);

  const handleAdd = () => {
    if (product.type === 'subscription' || product.type === 'deal') {
        setShowBundleModal(true);
        return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      type: product.type,
      size: selectedSize,
      price,
      quantity: 1,
      image: product.image,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-card text-card-foreground p-6 rounded-3xl shadow-xl shadow-orange-500/10 border-2 border-orange-100 flex flex-col gap-4 relative overflow-hidden group h-full"
    >
      {/* Decorative Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary rounded-full opacity-50 blur-2xl group-hover:bg-primary transition-colors duration-500" />
      
      <div className="flex justify-between items-start z-10">
        <div className="text-6xl filter drop-shadow-md origin-bottom-left group-hover:rotate-12 transition-transform duration-300">
          {product.image}
        </div>
        <div className="bg-primary text-primary-foreground font-display font-bold text-xl px-4 py-2 rounded-2xl rotate-3 shadow-sm">
          ${price.toFixed(2)}
        </div>
      </div>
      
      <div className="z-10 mt-2">
        <h3 className="font-display text-2xl mb-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
      </div>

      {product.availableSizes && (
        <div className="flex gap-2 mt-auto z-10 pt-4">
          {product.availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedSize === size
                  ? "bg-accent text-accent-foreground shadow-inner scale-95"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAdd}
        className={`w-full mt-${product.availableSizes ? '2' : 'auto'} bg-primary text-primary-foreground font-display text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow`}
      >
        <Plus size={20} strokeWidth={3} />
        {product.type === 'subscription' || product.type === 'deal' ? 'Configure Bundle' : 'Add to Cart'}
      </motion.button>

      {showBundleModal && allProducts && (
          <BundleSelectorModal product={product} allProducts={allProducts} onClose={() => setShowBundleModal(false)} />
      )}
    </motion.div>
  );
}

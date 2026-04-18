import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { type Product, type ProductSize } from "../lib/types";
import { addToCart } from "../lib/store";

interface BundleSelectorModalProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
}

export function BundleSelectorModal({ product, allProducts, onClose }: BundleSelectorModalProps) {
  const [selections, setSelections] = useState<{ id: string, name: string, image: string }[]>([]);
  
  const juices = allProducts.filter(p => p.type === 'juice');
  
  // Logic for how many and what type of selections to make
  let targetCount = 0;
  let titleText = "";
  
  if (product.id === 'dl-1') { // Double Trouble
      targetCount = 2;
      titleText = "Pick 2 Juices (8oz)";
  } else if (product.id === 'dl-2') { // Classic Bundle
      targetCount = 1;
      titleText = "Pick 1 Juice (8oz)";
  } else if (product.type === 'subscription') { // Weekly Gallon
      targetCount = 4;
      titleText = "Build Your Weekly 4-Gallon Pack (Pick 4)";
  }

  const handleSelect = (juice: Product) => {
      if (selections.length < targetCount) {
          setSelections([...selections, { id: juice.id, name: juice.name, image: juice.image }]);
      }
  };

  const handleRemove = (index: number) => {
      setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
      if (selections.length !== targetCount) return;

      const subItems = selections.map(s => ({
          name: s.name,
          quantity: 1,
          image: s.image,
      }));
      
      // If Classic Bundle, auto-inject the 2 hotdogs into the subItems visually
      if (product.id === 'dl-2') {
          subItems.unshift({ name: "Classic Hotdog", quantity: 2, image: "🌭" });
      }

      addToCart({
          productId: product.id,
          name: product.name,
          type: product.type,
          price: product.basePrice,
          quantity: 1,
          image: product.image,
          subItems,
      });

      onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
         onClick={onClose}
      >
         <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-card w-full max-w-2xl rounded-3xl border-2 border-border shadow-2xl p-6 md:p-8 sticky max-h-[90vh] overflow-y-auto"
         >
           <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="font-display text-3xl font-bold flex items-center gap-3">
                   {product.image} {product.name}
               </h3>
               <p className="font-bold text-muted-foreground">{titleText}</p>
             </div>
             <button onClick={onClose} className="p-2 bg-muted rounded-full hover:bg-border transition-colors">
               <X size={24} />
             </button>
           </div>

           {/* Selected Slots */}
           <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
               {Array.from({ length: targetCount }).map((_, i) => {
                   const sel = selections[i];
                   return (
                       <div key={i} className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${sel ? 'border-primary bg-primary/10' : 'border-dashed border-border bg-muted/50'}`}>
                           {sel ? (
                               <>
                                   <div className="text-3xl mb-1 relative">
                                       {sel.image}
                                       <button onClick={() => handleRemove(i)} className="absolute -top-3 -right-3 bg-card rounded-full shadow-sm text-muted-foreground hover:text-destructive border border-border">
                                           <X size={14} />
                                       </button>
                                   </div>
                                   <div className="text-[10px] text-center font-bold px-1 leading-tight">{sel.name}</div>
                               </>
                           ) : (
                               <div className="text-muted-foreground font-bold text-sm">Slot {i + 1}</div>
                           )}
                       </div>
                   );
               })}
           </div>

           <div className="font-display text-xl mb-4">Available Flavors</div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
               {juices.map(juice => (
                   <button 
                       key={juice.id}
                       onClick={() => handleSelect(juice)}
                       disabled={selections.length >= targetCount}
                       className="bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-left transition-all hover:scale-105 active:scale-95"
                   >
                       <div className="text-4xl mb-2">{juice.image}</div>
                       <div className="font-bold text-sm leading-tight">{juice.name}</div>
                   </button>
               ))}
           </div>

           <motion.button 
             whileHover={{ scale: selections.length === targetCount ? 1.02 : 1 }}
             whileTap={{ scale: selections.length === targetCount ? 0.98 : 1 }}
             onClick={handleAddToCart}
             disabled={selections.length !== targetCount}
             className={`w-full font-display text-2xl py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                 selections.length === targetCount 
                 ? 'bg-primary text-primary-foreground shadow-primary/30' 
                 : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
             }`}
           >
             {selections.length === targetCount ? (
                 <><Check size={24} strokeWidth={3} /> Add to Cart — ${product.basePrice.toFixed(2)}</>
             ) : (
                 `Select ${targetCount - selections.length} more item${targetCount - selections.length > 1 ? 's' : ''}`
             )}
           </motion.button>

         </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

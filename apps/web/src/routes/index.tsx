import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { getProducts } from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { BundleSelectorModal } from "../components/BundleSelectorModal";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: () => getProducts(),
});

function HomeComponent() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.5 } },
  };

  const products = Route.useLoaderData();
  const juices = products.filter((p) => p.type === "juice");
  const food = products.filter((p) => p.type === "hotdog");
  const subs = products.filter((p) => p.type === "subscription");
  const deals = products.filter((p) => p.type === "deal");

  const [selectedBundle, setSelectedBundle] = useState<any>(null);

  return (
    <>
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-background">
        {/* Decorative background blobs */}
      <div className="absolute top-10 -left-20 w-96 h-96 bg-primary rounded-full opacity-30 mix-blend-multiply blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-secondary rounded-full opacity-30 mix-blend-multiply blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent rounded-full opacity-20 mix-blend-multiply blur-[100px] pointer-events-none" />

      {/* Floating Emojis */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-20 left-10 md:left-40 text-7xl md:text-8xl opacity-80"
      >
        🍊
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-10 md:right-40 text-7xl md:text-8xl opacity-80"
      >
        🍋
      </motion.div>
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
        className="absolute top-40 right-20 md:right-32 text-6xl md:text-7xl opacity-80"
      >
        🍍
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-20 left-20 md:left-52 text-6xl md:text-7xl opacity-80"
      >
        🌭
      </motion.div>


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-4 max-w-4xl"
      >
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <span className="bg-white/50 backdrop-blur-md border border-white font-bold text-primary px-6 py-2 rounded-full text-sm uppercase tracking-wider shadow-sm">
            Fresh Squeezed Daily
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[1.1] mb-8 text-foreground drop-shadow-sm"
        >
          Taste the <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent filter drop-shadow-md">
            Joy of Juice
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-muted-foreground font-sans font-medium mb-12 max-w-2xl mx-auto"
        >
          Vibrant, fresh-squeezed citrus juices and classic hotdogs. Perfect for a sunny day pick-me-up!
        </motion.p>

        <motion.div variants={itemVariants} className="flex justify-center flex-col sm:flex-row gap-4">
          <a
            href="#menu"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-12 py-5 font-display text-2xl font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 hover:shadow-primary/50 active:scale-95"
          >
            <span className="absolute inset-0 h-full w-full bg-white/20 -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
            <span className="relative z-10">Order Now 🍹</span>
          </a>
          <a
            href="#menu"
            aria-label="Skip to menu"
            className="group relative inline-flex items-center justify-center rounded-full bg-white px-12 py-5 font-display text-2xl font-bold text-primary shadow-lg border-2 border-border transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="relative z-10">See Menu</span>
          </a>
        </motion.div>
      </motion.div>
      </div>

      {/* Menu Section */}
      <section id="menu" className="w-full bg-background pb-32">
        <div className="bg-secondary/20 py-16 px-6 border-y-4 border-secondary/40">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center font-display text-5xl md:text-6xl mb-12 text-secondary-foreground drop-shadow-sm">Current Deals</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:snap-none md:overflow-visible">
              <motion.button 
                onClick={() => setSelectedBundle(deals.find(d => d.id === 'dl-1'))}
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl shadow-primary/20 transform-gpu snap-always snap-center min-w-[85vw] md:min-w-0 text-left h-full"
              >
                <div className="text-5xl mb-4">🍹🍹</div>
                <h3 className="font-display text-3xl font-bold mb-3">Double Trouble</h3>
                <p className="font-sans font-medium opacity-90 text-lg">2 Juices (8oz) for just <span className="text-4xl font-bold bg-white text-primary px-3 rounded-2xl">$5</span></p>
              </motion.button>
              
              <motion.button 
                onClick={() => setSelectedBundle(deals.find(d => d.id === 'dl-2'))}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="bg-accent text-accent-foreground p-8 rounded-3xl shadow-xl shadow-accent/20 transform-gpu snap-always snap-center min-w-[85vw] md:min-w-0 text-left h-full"
              >
                <div className="text-5xl mb-4">🌭🍹</div>
                <h3 className="font-display text-3xl font-bold mb-3">The Classic Bundle</h3>
                <p className="font-sans font-medium opacity-90 text-lg">2 Hotdogs + Any Juice for <span className="text-4xl font-bold bg-white text-accent px-3 rounded-2xl">$8</span></p>
              </motion.button>

              <motion.button 
                onClick={() => setSelectedBundle(subs.find(s => s.id === 'sub-1'))}
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-foreground text-background p-8 rounded-3xl shadow-xl shadow-black/20 transform-gpu snap-always snap-center min-w-[85vw] md:min-w-0 relative overflow-hidden text-left h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-50 text-6xl transform rotate-12">🚚</div>
                <div className="text-5xl mb-4 relative z-10">🗓️🍋</div>
                <h3 className="font-display text-3xl font-bold mb-3 relative z-10">Weekly Gallon</h3>
                <p className="font-sans font-medium opacity-90 text-lg relative z-10">4 Gallons/mo delivered <span className="text-4xl font-bold bg-primary text-primary-foreground px-3 rounded-2xl">$40</span></p>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 py-16">
          <div className="px-6 mb-8">
            <h2 className="font-display text-5xl flex items-center gap-4">
              <span className="text-primary">Fresh Juices</span> 🥤
            </h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:snap-none md:overflow-visible md:px-6">
            {juices.map((product) => (
              <div key={product.id} className="snap-always snap-center min-w-[85vw] sm:min-w-[350px] md:min-w-0 h-full flex flex-col">
                <ProductCard product={product} allProducts={products} />
              </div>
            ))}
          </div>

          <div className="px-6 mt-8 mb-8">
            <h2 className="font-display text-5xl flex items-center gap-4">
              <span className="text-accent">Hotdogs & Extras</span> 🌭
            </h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:snap-none md:overflow-visible md:px-6">
            {food.map((product) => (
              <div key={product.id} className="snap-always snap-center min-w-[85vw] sm:min-w-[350px] md:min-w-0 h-full flex flex-col">
                <ProductCard product={product} allProducts={products} />
              </div>
            ))}
          </div>
          
          <div className="px-6 mt-8 mb-8">
             <h2 className="font-display text-5xl flex items-center gap-4 text-foreground">
               Subscriptions 🚚
             </h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:snap-none md:overflow-visible md:px-6">
            {subs.map((product) => (
              <div key={product.id} className="snap-always snap-center min-w-[85vw] sm:min-w-[350px] md:min-w-0 h-full flex flex-col">
                <ProductCard product={product} allProducts={products} />
              </div>
            ))}
          </div>
        </div>

        {selectedBundle && (
            <BundleSelectorModal product={selectedBundle} allProducts={products} onClose={() => setSelectedBundle(null)} />
        )}
      </section>
    </>
  );
}

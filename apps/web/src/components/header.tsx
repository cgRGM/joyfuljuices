import { Link } from "@tanstack/react-router";
import { ShoppingBag, Citrus } from "lucide-react";
import UserMenu from "./user-menu";
import { toggleCart, useCart } from "../lib/store";
import { motion } from "framer-motion";

export default function Header() {
  const { items } = useCart();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const links = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/admin", label: "Admin" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b-2 border-border/50">
      <div className="flex flex-row items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 180 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
              <Citrus size={32} className="text-primary stroke-[2.5px]" />
            </motion.div>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight hidden sm:block">
              Joyful Juices
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6 text-lg font-bold">
            {links.map(({ to, label }) => {
              // Special case for Menu link to act as a smooth scroll to the #menu section if we are on /
              if (label === "Menu") {
                return (
                  <a
                    key={label}
                    href="/#menu"
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {label}
                  </a>
                );
              }

              return (
                <Link 
                  key={to} 
                  to={to} 
                  activeProps={{ className: "text-primary" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground transition-colors" }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleCart()}
            className="hidden md:flex relative p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full transition-colors items-center gap-2 px-4 shadow-sm"
          >
            <ShoppingBag size={20} className="stroke-[2.5px]" />
            <span className="font-bold mr-1 hidden sm:block">Cart</span>
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalItems}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
          <div className="hidden md:block h-8 w-[2px] bg-border mx-2"></div>
          <UserMenu />
        </div>
      </div>
      
      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-card/90 backdrop-blur-xl border-2 border-border shadow-2xl rounded-full px-6 py-3 flex items-center justify-between z-50">
         <Link to="/" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors" activeProps={{ className: "!text-primary" }}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Home</span>
         </Link>
         
         <a href="/#menu" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
            <span className="text-xl">🍹</span>
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Menu</span>
         </a>

         <button 
           onClick={() => toggleCart()}
           className="relative flex flex-col items-center text-secondary hover:text-secondary/80 transition-colors -mt-4 bg-background p-3 rounded-full border-2 border-border shadow-md"
         >
            <ShoppingBag size={24} className="stroke-[2.5px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
         </button>

         <Link to="/admin" className="flex flex-col items-center text-muted-foreground hover:text-accent transition-colors" activeProps={{ className: "!text-accent" }}>
            <span className="text-xl">🛡️</span>
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Admin</span>
         </Link>
      </nav>
    </header>
  );
}

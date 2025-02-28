
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { GitHub, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { logoutMutation, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <motion.div 
      className="navbar bg-background border-b"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-start">
        <div className="dropdown">
          <motion.div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost btn-circle"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDropdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </motion.div>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-background/95 backdrop-blur-sm rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <li>
                  <a 
                    href="https://github.com/yourusername/your-repo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <GitHub size={16} /> GitHub Repository
                  </a>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="navbar-center">
        <motion.a 
          className="btn btn-ghost text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          CodeRefactor
        </motion.a>
      </div>
      <div className="navbar-end">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <motion.button 
              className="btn btn-ghost btn-circle"
              onClick={handleLogout}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

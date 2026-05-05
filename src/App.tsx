/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-3 md:py-4 px-5 md:px-12 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-xl md:text-2xl font-display font-medium tracking-tight text-white">AniMax</h1>
          </motion.div>
          
          <nav className="flex items-center gap-8">
            {/* Navigation */}
          </nav>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="py-12 px-6 md:px-12 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-2">
              {/* Footer info */}
            </div>
            <div className="text-xs text-white/20 uppercase tracking-widest">
              © {new Date().getFullYear()} AniMax. Find best anime walpaper here
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

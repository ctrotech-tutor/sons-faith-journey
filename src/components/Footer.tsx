import { motion } from "framer-motion";
import { Heart, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Assets } from "@/assets/assets";
import React from "react";

const sloganWords = ["Faith", "Purpose", "Growth"];

type FooterProps = {
  className?: string;
  withLinks?: boolean;
};

export const Footer: React.FC<FooterProps> = ({ className, withLinks = false }) => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn("bg-gray-950 text-white py-12", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Logo and Name */}
        <div className="flex items-center justify-center gap-2">
          <div className="">
            <img src={Assets.Logo4} alt="THE SONS Logo" className="h-10 w-10 rounded-lg object-cover" />
          </div>
          <span className="text-2xl font-bold tracking-tight">THE SONS</span>
        </div>

        {/* Slogan */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
          className="flex items-center justify-center gap-2"
        >
          {sloganWords.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.25 }}
              className="text-gray-400 font-medium text-sm uppercase tracking-wide"
            >
              {word}
              {index < sloganWords.length - 1 && <span className="mx-1 text-purple-500">·</span>}
            </motion.span>
          ))}
        </motion.div>

        {/* Optional Links */}
        {withLinks && (
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }} className="hover:text-white transition">About</a>
            <a href="/community" className="hover:text-white transition">Community</a>
            <a href="/support" className="hover:text-white transition">Support</a>
          </div>
        )}

        {/* Contact & Social */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4 text-sm text-gray-400">
          <a
            href="https://wa.me/2349041622945"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-green-400 transition"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href="mailto:thesonhub@gmail.com"
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <Mail className="h-4 w-4" />
            Email Us
          </a>
        </div>

        {/* Powered By */}
        <div className="text-xs text-gray-500 mt-4">
          Powered by{" "}
          <a
            href="https://ctrotech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            <span>CTROTECH</span>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-600 mt-2">
          © {year} THE SONS. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export function FadeIn({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

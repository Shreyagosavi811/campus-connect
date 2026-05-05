import { motion } from "framer-motion";

export default function FloatingBlobs() {
  const blobs = [
    { color: "bg-indigo-400", size: "w-72 h-72", initial: { x: -100, y: -100 }, animate: { x: [0, 100, 0], y: [0, 50, 0] }, duration: 20 },
    { color: "bg-sky-400", size: "w-96 h-96", initial: { x: 400, y: 200 }, animate: { x: [0, -150, 0], y: [0, 100, 0] }, duration: 25 },
    { color: "bg-purple-400", size: "w-64 h-64", initial: { x: -200, y: 400 }, animate: { x: [0, 80, 0], y: [0, -120, 0] }, duration: 18 },
    { color: "bg-rose-400", size: "w-80 h-80", initial: { x: 600, y: -150 }, animate: { x: [0, -200, 0], y: [0, 200, 0] }, duration: 30 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-slate-50" />
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          initial={blob.initial}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${blob.color} ${blob.size}`}
        />
      ))}
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}

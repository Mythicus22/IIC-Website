import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const ScrollReveal = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: variants.hidden,
        visible: { ...variants.visible, transition: { ...variants.visible.transition, delay } }
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

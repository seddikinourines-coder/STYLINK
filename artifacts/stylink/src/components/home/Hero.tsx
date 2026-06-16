import { useRef } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import heroImg from "@/assets/images/hero.png";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [0.95, 0.55, 0.35],
  );
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.7, 0]);
  const heroScale = useTransform(scrollYProgress, [0.5, 1], [1, 0.94]);
  const heroRadius = useTransform(scrollYProgress, [0.5, 1], [0, 32]);

  const motionStyles = reduced
    ? {}
    : { scale: heroScale, borderBottomLeftRadius: heroRadius, borderBottomRightRadius: heroRadius };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[180vh] -mt-20"
      data-testid="section-hero"
    >
      <motion.div
        className="sticky top-0 h-[100dvh] min-h-[700px] overflow-hidden bg-secondary will-change-transform"
        style={{ ...motionStyles, transformOrigin: "center top" }}
      >
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          style={reduced ? {} : { y: imageY, scale: imageScale }}
        >
          <motion.img
            src={heroImg}
            alt="Haute Couture Algérienne"
            className="w-full h-full object-cover object-center"
            style={reduced ? { opacity: 0.95 } : { opacity: imageOpacity }}
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-background/90 mix-blend-multiply" />
        </motion.div>

        <motion.div
          className="relative z-10 h-full container px-6 flex flex-col items-center justify-center text-center mx-auto"
          style={reduced ? {} : { y: contentY, opacity: contentOpacity }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white mb-10 max-w-[90vw] lg:max-w-5xl leading-[1.1] drop-shadow-xl flex flex-col items-center"
          >
            <span className="tracking-tight block w-full">{t('hero.title')}</span>
            <span className="italic font-light text-[#B8956A] mt-[-0.1em] block w-full">{t('hero.title_italic')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="text-white/85 text-base md:text-lg max-w-2xl mb-12 font-sans font-light leading-relaxed px-4"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4"
          >
            <Button
              asChild
              size="lg"
              className="rounded-none bg-[#B8956A] text-white hover:bg-[#B8956A]/90 font-sans tracking-[0.2em] uppercase px-12 h-14 text-sm w-full sm:w-auto"
            >
              <Link href="/shop" data-testid="button-hero-shop">
                {t('hero.explore')}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none border-white/40 text-white hover:bg-white hover:text-black font-sans tracking-[0.2em] uppercase px-12 h-14 text-sm bg-transparent backdrop-blur-sm w-full sm:w-auto"
            >
              <Link href="/designers" data-testid="button-hero-designers">
                {t('hero.our_designers')}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-3"
          style={reduced ? {} : { opacity: contentOpacity }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/70 font-sans">
            {t('hero.scroll')}
          </span>
          <div className="w-[1px] h-10 bg-white/40 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-[slideDown_2s_ease-in-out_infinite]"></div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

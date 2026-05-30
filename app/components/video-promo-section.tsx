"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  VIDEO_DIVULGACAO_POSTER,
  VIDEO_DIVULGACAO_SRC,
} from "../lib/site-assets";

export function VideoPromoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35, once: false });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.controls = true;

    const showControls = () => {
      video.controls = true;
    };
    video.addEventListener("play", showControls);

    if (inView) {
      video.play().catch(() => {
        /* autoplay bloqueado — controlos manuais */
      });
    } else {
      video.pause();
    }

    return () => video.removeEventListener("play", showControls);
  }, [inView]);

  return (
    <section
      id="video"
      ref={sectionRef}
      className="relative scroll-mt-20 border-b border-gold/10 bg-background py-10 sm:py-14"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(198,164,75,0.06),transparent_65%)]" />

      <motion.div
        className="relative z-10 mx-auto mb-6 max-w-6xl px-4 text-center sm:mb-8 sm:px-6"
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6 }}
      >
        <p className="section-label">Divulgação</p>
        <h2 className="font-display mt-2 text-lg font-semibold tracking-[0.15em] text-foreground uppercase sm:text-xl">
          O Carrista em imagem
        </h2>
      </motion.div>

      <motion.div
        className="video-bleed relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="video-frame mx-auto flex justify-center">
          <div className="video-player-shell">
            <video
              ref={videoRef}
              className="video-promo-player"
              controls
              playsInline
              muted
              loop
              preload="auto"
              poster={VIDEO_DIVULGACAO_POSTER}
            >
            <source src={VIDEO_DIVULGACAO_SRC} type="video/mp4" />
            O seu browser não suporta vídeo HTML5.{" "}
            <a href={VIDEO_DIVULGACAO_SRC} className="text-gold underline">
              Descarregar vídeo
            </a>
            </video>
          </div>
        </div>
        <p className="mx-auto mt-3 max-w-lg px-4 text-center text-[0.65rem] text-muted">
          Reprodução automática sem som. Use os controlos para ativar o áudio.
        </p>
      </motion.div>
    </section>
  );
}

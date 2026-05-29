/**
 * Imagens em public/images/
 * Ao trocar ficheiros, aumente a versão correspondente.
 */
export const LOGO_VERSION = "1";
export const CASTELO_VERSION = "1";

/** Logo O Carrista — public/images/ocarrista.png */
export const LOGO_SRC = `/images/ocarrista.png?v=${LOGO_VERSION}`;
export const CASTELO_SRC = `/images/cc_castelo.png?v=${CASTELO_VERSION}`;

export const LOGO_ALT = "O Carrista — figura comemorativa do carrista";

/** @deprecated use LOGO_SRC */
export const BRASAO_SRC = LOGO_SRC;
/** @deprecated use LOGO_ALT */
export const BRASAO_ALT = LOGO_ALT;

/** PDF para slideshow em ecrã completo — public/historia/slideshow.pdf */
export const HISTORIA_SLIDESHOW_VERSION = "2";
export const HISTORIA_SLIDESHOW_PDF = `/historia/slideshow.pdf?v=${HISTORIA_SLIDESHOW_VERSION}`;

export const GRITO_LINHA_1 = "À minha voz.....";
export const GRITO_LINHA_2 = "FOGO!";

/** Lema do Quartel da Cavalaria e do RC4 */
export const LEMA_QCAV_RC4 = "Perguntai ao Inimigo quem Somos";

/** Vídeo de divulgação — public/videos/divulgacao.mp4 */
export const VIDEO_DIVULGACAO_VERSION = "3";
export const VIDEO_DIVULGACAO_SRC = `/videos/divulgacao.mp4?v=${VIDEO_DIVULGACAO_VERSION}`;
/** Opcional: imagem antes de carregar — public/videos/divulgacao-poster.jpg */
export const VIDEO_DIVULGACAO_POSTER = "/videos/divulgacao-poster.jpg";

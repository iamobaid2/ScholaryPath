import { WHATSAPP_NUMBER } from "./catalog";
export const waLink = (text = "Hi ScholaryPath, I'd like to talk with an expert.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

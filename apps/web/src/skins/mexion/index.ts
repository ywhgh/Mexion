import type { App, Plugin } from "vue";

import "./styles/tokens.css";
import "@/styles/mexion-skin.css";
import "@/styles/mexion-dashboard.css";
import "@/styles/mexion-static-pages.css";
import "@/styles/mexion-brand.css";
import "./styles/motion.css";
import "./styles/interaction-motion.css";
import "./styles/application-extensions.css";
import "./styles/commerce-ledgers.css";
import "./styles/subscriptions.css";
import "./styles/api-keys.css";
import "./styles/redeem-ledger.css";
import "@/styles/mexion-overlays.css";

export { default as MexionOverlayHost } from "./components/MexionOverlayHost.vue";
export { MEXION_BRAND_ASSETS, resolveMexionSidebarMark } from "./brand";
export {
  isMexionLocalPreviewActive,
  isMexionLocalPreviewRequested,
  prepareMexionLocalPreview,
} from "./local-preview";

export const MEXION_SKIN_ID = "mexion" as const;

export const MexionSkin: Plugin = {
  install() {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.mexionSkin = MEXION_SKIN_ID;
    root.classList.add("mexion-skin-root");
  },
};

export function installMexionSkin(app: App) {
  app.use(MexionSkin);
}

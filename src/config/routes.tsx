import {
  MdSettings,
  MdDeveloperBoard,
  MdAutoStories,
  MdPermMedia,
  MdSignLanguage,
  MdTranslate,
  MdRecentActors,
  MdLiveHelp,
  MdContentPaste,
} from "react-icons/md";
import { ROUTE_ACCESS, RoutePath } from "@/config/route-access";

type RouteDisplay = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  placement: "main" | "footer";
};

export type RouteConfig = RouteDisplay & { path: RoutePath };

const ROUTE_DISPLAY: Record<RoutePath, RouteDisplay> = {
  "/dashboard": {
    title: "Painel de Controle",
    subtitle: "Visão geral do sistema",
    icon: MdDeveloperBoard,
    placement: "main",
  },
  "/library": {
    title: "Biblioteca",
    subtitle: "Recursos e materiais",
    icon: MdAutoStories,
    placement: "main",
  },
  "/boards": {
    title: "Pranchas",
    subtitle: "Gerencie as pranchas do sistema",
    icon: MdContentPaste,
    placement: "main",
  },
  "/pictograms": {
    title: "Pictogramas",
    subtitle: "Gerencie os pictogramas do sistema",
    icon: MdPermMedia,
    placement: "main",
  },
  "/sign-writings": {
    title: "SignWriting",
    subtitle: "Gerencie os SignWritings do sistema",
    icon: MdSignLanguage,
    placement: "main",
  },
  "/terms": {
    title: "Termos",
    subtitle: "Gerencie os termos do sistema",
    icon: MdTranslate,
    placement: "main",
  },
  "/management": {
    title: "Gerenciamento",
    subtitle: "Administre usuários, áreas de atuação e outros",
    icon: MdRecentActors,
    placement: "main",
  },
  "/settings": {
    title: "Configurações",
    subtitle: "Preferências e configurações",
    icon: MdSettings,
    placement: "footer",
  },
  "/help": {
    title: "Ajuda",
    subtitle: "Suporte e documentação",
    icon: MdLiveHelp,
    placement: "footer",
  },
};

export const ROUTES: RouteConfig[] = ROUTE_ACCESS.map((r) => ({
  path: r.path,
  ...ROUTE_DISPLAY[r.path],
}));

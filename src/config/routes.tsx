import {
  MdSettings,
  MdDeveloperBoard,
  MdAutoStories,
  MdPermMedia,
  MdRecentActors,
  MdLiveHelp,
  MdContentPaste,
} from "react-icons/md";
import { Role } from "@/utils/definitions";

export type RouteConfig = {
  path: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  placement: "main" | "footer";
  allowedRoles: "all" | Role[];
};

export const ROUTES: RouteConfig[] = [
  {
    path: "/dashboard",
    title: "Painel de Controle",
    subtitle: "Visão geral do sistema",
    icon: MdDeveloperBoard,
    placement: "main",
    allowedRoles: "all",
  },
  {
    path: "/library",
    title: "Biblioteca",
    subtitle: "Recursos e materiais",
    icon: MdAutoStories,
    placement: "main",
    allowedRoles: "all",
  },
  {
    path: "/boards",
    title: "Pranchas",
    subtitle: "Gerencie as pranchas do sistema",
    icon: MdContentPaste,
    placement: "main",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    path: "/pictograms",
    title: "Pictogramas",
    subtitle: "Gerencie os pictogramas do sistema",
    icon: MdPermMedia,
    placement: "main",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    path: "/management",
    title: "Gerenciamento",
    subtitle: "Administre usuários, áreas de atuação e outros",
    icon: MdRecentActors,
    placement: "main",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    path: "/settings",
    title: "Configurações",
    subtitle: "Preferências e configurações",
    icon: MdSettings,
    placement: "footer",
    allowedRoles: "all",
  },
  {
    path: "/help",
    title: "Ajuda",
    subtitle: "Suporte e documentação",
    icon: MdLiveHelp,
    placement: "footer",
    allowedRoles: "all",
  },
];

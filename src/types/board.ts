import { PictogramOutput } from "./pictogram";

// Mirrors BOARD_TYPES in the api repo.
export const BOARD_TYPES = ["common", "emergency"] as const;

export type BoardType = (typeof BOARD_TYPES)[number];

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
  common: "Comum",
  emergency: "Emergência",
};

export type BoardOutput = {
  uuid: string;
  title: string;
  type: BoardType;
  authorUuid: string | null;
  representativePictogram: PictogramOutput;
  termCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

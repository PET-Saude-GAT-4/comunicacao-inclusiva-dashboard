import { TermPlacementOutput } from "./term";

export type PhraseOutput = {
  uuid: string;
  description: string;
  authorUuid: string | null;
  terms: TermPlacementOutput[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

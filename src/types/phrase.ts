import { TermPlacementOutput } from "./term";

export type PhraseOutput = {
  uuid: string;
  description: string;
  authorUuid: string | null;
  terms: TermPlacementOutput[];
  publishedAt: string | null;
  listedInLibrary: boolean;
  createdAt: string;
  updatedAt: string;
};

import { PictogramOutput } from "./pictogram";
import { SignWritingOutput } from "./sign-writing";

export type TermOutput = {
  uuid: string;
  description: string;
  pictogram: PictogramOutput;
  signWriting: SignWritingOutput;
  createdAt: string;
  updatedAt: string;
};

export type TermPlacementOutput = {
  uuid: string;
  termUuid: string;
  description: string;
  pictogram: PictogramOutput;
  signWriting: SignWritingOutput;
  order: number;
};

export type BoardTermOutput = TermPlacementOutput;

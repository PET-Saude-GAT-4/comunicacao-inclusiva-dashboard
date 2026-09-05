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

export type BoardTermOutput = {
  uuid: string;
  termUuid: string;
  description: string;
  pictogram: PictogramOutput;
  signWriting: SignWritingOutput;
  order: number;
};

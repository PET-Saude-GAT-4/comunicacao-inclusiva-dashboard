import { PictogramOutput } from "./pictogram";

export type BoardOutput = {
  uuid: string;
  title: string;
  authorUuid: string | null;
  representativePictogram: PictogramOutput;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PictogramOutput = {
  uuid: string;
  authorUuid: string | null;
  description: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
};

// The authenticated list also names the terms that use each pictogram, so a
// page of cards needs no separate term lookup.
export type PictogramListItem = PictogramOutput & {
  terms: { uuid: string; description: string }[];
};

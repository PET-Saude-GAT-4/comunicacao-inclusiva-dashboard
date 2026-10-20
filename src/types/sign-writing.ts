export type SignWritingOutput = {
  uuid: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
};

// The authenticated list also names the terms that use each SignWriting.
export type SignWritingListItem = SignWritingOutput & {
  terms: { uuid: string; description: string }[];
};

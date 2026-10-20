// Mirrors the API's exclusive arc: a chain is triggered by exactly one thing.
export type ChainTrigger =
  | { type: "board"; uuid: string }
  | { type: "phrase"; uuid: string };

export type InteractionChainOutput = {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  // The API names both ends, so a chain can be labelled without loading the
  // boards and phrases it points to. The title is the phrase's description
  // when a phrase is the trigger.
  trigger: ChainTrigger & { title: string };
  responseBoardUuid: string;
  responseBoardTitle: string;
  rank: number;
  label?: string;
};

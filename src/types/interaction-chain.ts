// Mirrors the API's exclusive arc: a chain is triggered by exactly one thing.
export type ChainTrigger =
  | { type: "board"; uuid: string }
  | { type: "phrase"; uuid: string };

export type InteractionChainOutput = {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  trigger: ChainTrigger;
  responseBoardUuid: string;
  rank: number;
  label?: string;
};

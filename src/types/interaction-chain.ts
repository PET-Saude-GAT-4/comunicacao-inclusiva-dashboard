export type InteractionChainOutput = {
  id: number;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  triggerBoardUuid: string;
  responseBoardUuid: string;
  label?: string;
};
export type ProfessionOutput = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type SpecialityOutput = {
  id: number;
  name: string;
  code: string;
  professionCode: string;
  createdAt: string;
  updatedAt: string;
};

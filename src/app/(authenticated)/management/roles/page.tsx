"use client";

import { redirect } from "next/navigation";
import TabButton from "../Components/TabButton/TabButton";
import RemoveButton from "../Components/RemoveButton/RemoveButton";
import AddButton from "../Components/AddButton/AddButton";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
} from "react-icons/md";
import Table from "../Components/Table/Table";

function Professions() {
  const mockRoles = [
    {
      id: 1,
      role: "Administrador",
      createdAt: "12/01/2024",
    },
    {
      id: 2,
      role: "Visualizador",
      createdAt: "23/03/2024",
    },
    {
      id: 3,
      role: "Gerente de Equipe",
      createdAt: "05/05/2024",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading  px-lg py-md">
        <p>Permissões</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton icon={MdPeople} active={false} />
          <TabButton
            icon={MdAssignmentInd}
            active={false}
            onClick={() => {
              redirect(`management/specialities`);
            }}
          />
          <TabButton
            icon={MdMedicalInformation}
            active={false}
            onClick={() => {
              redirect(`management/specialities`);
            }}
          />
          <TabButton
            icon={MdLocalPolice}
            active={true}
          />
        </nav>

      </div>
      <div className="flex-1">
        <Table
          data={mockRoles}
          columns={[
            { key: "id", label: "ID" },
            { key: "role", label: "Nível de Permissão" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
        />
      </div>
    </div>
  );
}

export default Professions;

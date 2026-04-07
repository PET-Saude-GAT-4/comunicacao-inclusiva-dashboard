"use client";

import { redirect } from "next/navigation";
import TabButton from "../Components/TabButton/TabButton";
import RemoveButton from "../Components/RemoveButton/RemoveButton";
import AddButton from "../Components/AddButton/AddButton";
import SearchBar from "../Components/SearchBar/SearchBar";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
} from "react-icons/md";
import Table from "../Components/Table/Table";

function Professions() {
  const mockProfessions = [
    {
      id: 1,
      profession: "Medicina",
      createdAt: "12/01/2024",
    },
    {
      id: 2,
      profession: "Enfermagem",
      createdAt: "23/03/2024",
    },
    {
      id: 3,
      profession: "Fisioterapia",
      createdAt: "05/05/2024",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading  px-lg py-md">
        <p>Áreas de Atuação</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton
            icon={MdPeople}
            active={false}
            onClick={() => {
              redirect(`/management/users`);
            }}
          />
          <TabButton icon={MdAssignmentInd} active={true} onClick={() => {}} />
          <TabButton
            icon={MdMedicalInformation}
            active={false}
            onClick={() => {
              redirect(`/management/specialities`);
            }}
          />
          <TabButton
            icon={MdLocalPolice}
            active={false}
            onClick={() => {
              redirect(`/management/roles`);
            }}
          />
        </nav>
        <div className="flex">
          {/* <SearchBar/> */}
        </div>
        <div className="flex">
          <AddButton onClick={() => {}} />
          {/* Activates if a user is selected */}
          <RemoveButton active={false} onClick={() => {}} />
        </div>
      </div>
      <div className="flex-1">
        <Table
          data={mockProfessions}
          columns={[
            { key: "id", label: "ID" },
            { key: "profession", label: "Área de Atuação" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
        />
      </div>
    </div>
  );
}

export default Professions;

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
  const mockSpecialities = [
    {
      id: 1,
      speciality: "Cardiologia",
      profession: "Medicina",
      createdAt: "12/01/2024",
    },
    {
      id: 2,
      speciality: "Neurologia",
      profession: "Medicina",
      createdAt: "23/03/2024",
    },
    {
      id: 3,
      speciality: "Pediatria",
      profession: "Medicina",
      createdAt: "05/05/2024",
    },
    {
      id: 4,
      speciality: "Triagem",
      profession: "Enfermagem",
      createdAt: "05/05/2024",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading  px-lg py-md">
        <p>Especialidades Médicas</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton
            icon={MdPeople}
            active={false}
            onClick={() => {
              redirect(`management/users`);
            }}
          />
          <TabButton
            icon={MdAssignmentInd}
            active={false}
            onClick={() => {
              redirect(`management/professions`);
            }}
          />
          <TabButton icon={MdMedicalInformation} active={true} />
          <TabButton
            icon={MdLocalPolice}
            active={false}
            onClick={() => {
              redirect(`management/roles`);
            }}
          />
        </nav>
        <div>
          <p>search</p>
        </div>
        <div className="flex">
          <AddButton onClick={() => {}} />
          {/* Activates if a user is selected */}
          <RemoveButton active={false} onClick={() => {}} />
        </div>
      </div>
      <div className="flex-1">
        <Table
          data={mockSpecialities}
          columns={[
            { key: "id", label: "ID" },
            { key: "speciality", label: "Especialidade" },
            { key: "profession", label: "Profissão Vinculada" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
        />
      </div>
    </div>
  );
}

export default Professions;

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
import SearchBar from "../Components/SearchBar/SearchBar";
import { useState } from "react";

function Users() {
  const mockUsers = [
    {
      id: 1,
      email: "ana.silva@email.com",
      role: "Administrador",
      createdAt: "12/01/2024",
    },
    {
      id: 2,
      email: "carlos.souza@email.com",
      role: "Visualizador",
      createdAt: "23/03/2024",
    },
    {
      id: 3,
      email: "mariana.lima@email.com",
      role: "Administrador",
      createdAt: "05/05/2024",
    },
    {
      id: 4,
      email: "pedro.costa@email.com",
      role: "Visualizador",
      createdAt: "18/07/2024",
    },
    {
      id: 5,
      email: "julia.ferreira@email.com",
      role: "Visualizador",
      createdAt: "30/09/2024",
    },
  ];

  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading  px-lg py-md">
        <p>Usuários</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton icon={MdPeople} active={true} />
          <TabButton
            icon={MdAssignmentInd}
            active={false}
            onClick={() => {
              redirect(`/management/professions`);
            }}
          />
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
        <div className="flex w-full justify-around">
          {/* <SearchBar/> */}
        </div>
        <div className="flex">
          <AddButton onClick={() => {}} />
          {/* Activates if a user is selected */}
          <RemoveButton active={false} onClick={() => {}} />
        </div>
      </div>
      <div>
        <Table
          data={mockUsers}
          columns={[
            { key: "id", label: "ID" },
            { key: "email", label: "Usuário" },
            { key: "role", label: "Nível de Permissões" },
            { key: "createdAt", label: "Data de Ingresso" },
          ]}
        />
      </div>
    </div>
  );
}

export default Users;

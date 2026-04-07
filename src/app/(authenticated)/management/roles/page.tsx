"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TabButton from "../Components/TabButton/TabButton";
import RemoveButton from "../Components/RemoveButton/RemoveButton";
import AddButton from "../Components/AddButton/AddButton";
import Modal from "../Components/Modal/Modal";
import Table from "../Components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
} from "react-icons/md";
import { getRoles, createRole, deleteRole } from "@/services/management";
import { RoleOutput } from "@/utils/definitions";

type RoleRow = { id: number; name: string; createdAt: string };

function toRow(r: RoleOutput): RoleRow {
  return {
    id: r.id,
    name: r.name,
    createdAt: new Date(r.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Roles() {
  const [data, setData] = useState<RoleRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");

  const fetchData = () => getRoles().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    const result = await createRole({ name });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setName("");
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar permissão.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteRole(id)));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Permissões</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton
            icon={MdPeople}
            active={false}
            onClick={() => redirect("/management/users")}
          />
          <TabButton
            icon={MdAssignmentInd}
            active={false}
            onClick={() => redirect("/management/professions")}
          />
          <TabButton
            icon={MdMedicalInformation}
            active={false}
            onClick={() => redirect("/management/specialities")}
          />
          <TabButton icon={MdLocalPolice} active={true} />
        </nav>
        <div>
          <p>search</p>
        </div>
        <div className="flex">
          <AddButton onClick={() => setIsModalOpen(true)} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      <div className="flex-1">
        <Table
          data={data}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Nível de Permissão" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Permissão"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="ex: admin"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <Button type="button" onClick={handleCreate}>
            Criar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Roles;

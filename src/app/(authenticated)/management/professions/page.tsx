"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TabButton from "@/components/TabButton/TabButton";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
} from "react-icons/md";
import {
  getProfessions,
  createProfession,
  deleteProfession,
} from "@/services/management";
import { ProfessionOutput } from "@/utils/definitions";

type ProfessionRow = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
};

function toRow(p: ProfessionOutput): ProfessionRow {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    createdAt: new Date(p.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Professions() {
  const [data, setData] = useState<ProfessionRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const fetchData = () =>
    getProfessions().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    const result = await createProfession({ name, code });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setName("");
      setCode("");
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar profissão.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteProfession(Number(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Áreas de Atuação</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
        <nav className="flex justify-between">
          <TabButton
            icon={MdPeople}
            active={false}
            onClick={() => redirect("/management/users")}
          />
          <TabButton icon={MdAssignmentInd} active={true} />
          <TabButton
            icon={MdMedicalInformation}
            active={false}
            onClick={() => redirect("/management/specialities")}
          />
          <TabButton
            icon={MdLocalPolice}
            active={false}
            onClick={() => redirect("/management/roles")}
          />
        </nav>
        <div className="flex">{/* <SearchBar/> */}</div>
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
            { key: "name", label: "Área de Atuação" },
            { key: "code", label: "Código" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Área de Atuação"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="ex: Medicina"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="code"
            label="Código"
            type="text"
            placeholder="ex: MED"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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

export default Professions;

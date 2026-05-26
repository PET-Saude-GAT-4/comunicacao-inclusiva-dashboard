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
  getSpecialities,
  createSpeciality,
  deleteSpeciality,
} from "@/services/professions";
import { SpecialityOutput } from "@/utils/definitions";

type SpecialityRow = {
  id: number;
  name: string;
  code: string;
  professionCode: string;
  createdAt: string;
};

function toRow(s: SpecialityOutput): SpecialityRow {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    professionCode: s.professionCode,
    createdAt: new Date(s.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Specialities() {
  const [data, setData] = useState<SpecialityRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [professionCode, setProfessionCode] = useState("");

  const fetchData = () =>
    getSpecialities().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    const result = await createSpeciality({ name, code, professionCode });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setName("");
      setCode("");
      setProfessionCode("");
      fetchData();
    } else {  
      setFormError(result.error ?? "Erro ao criar especialidade.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteSpeciality(Number(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Especialidades Médicas</p>
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
          <TabButton icon={MdMedicalInformation} active={true} />
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
            { key: "name", label: "Especialidade" },
            { key: "code", label: "Código" },
            { key: "professionCode", label: "Código da Profissão" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Especialidade"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="name"
            label="Nome"
            type="text"
            placeholder="ex: Cardiologia"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id="code"
            label="Código"
            type="text"
            placeholder="ex: CARD"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            id="professionCode"
            label="Código da Profissão"
            type="text"
            placeholder="ex: MED"
            value={professionCode}
            onChange={(e) => setProfessionCode(e.target.value)}
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

export default Specialities;

"use client";

import { Suspense, useState } from "react";
import PillTabs from "@/components/PillTabs/PillTabs";
import { MANAGEMENT_GROUP } from "@/config/navigation";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  getSpecialityPage,
  createSpeciality,
  deleteSpeciality,
} from "@/services/professions";
import { SpecialityOutput } from "@/types/profession";

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
  const list = usePaginatedList("specialities", getSpecialityPage, {
    pageSize: 10,
  });
  const { selectedIds } = list;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [professionCode, setProfessionCode] = useState("");

  const handleCreate = async () => {
    const result = await createSpeciality({ name, code, professionCode });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setName("");
      setCode("");
      setProfessionCode("");
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar especialidade.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteSpeciality(Number(id))));
    list.refresh();
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <PillTabs
          label={MANAGEMENT_GROUP.title}
          pages={MANAGEMENT_GROUP.pages}
        />
        <div className="mx-lg w-100">
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar especialidades"
          />
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
          key={list.listKey}
          data={list.items.map(toRow)}
          page={list.page}
          pageCount={list.pageCount}
          onPageChange={list.setPage}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Especialidade" },
            { key: "code", label: "Código" },
            { key: "professionCode", label: "Código da Profissão" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={list.setSelectedIds}
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

export default function SpecialitiesPage() {
  return (
    <Suspense>
      <Specialities />
    </Suspense>
  );
}

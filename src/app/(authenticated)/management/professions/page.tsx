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
  getProfessionPage,
  createProfession,
  deleteProfession,
} from "@/services/professions";
import { ProfessionOutput } from "@/types/profession";

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
  const list = usePaginatedList("professions", getProfessionPage, {
    pageSize: 10,
  });
  const { selectedIds } = list;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = async () => {
    const result = await createProfession({ name, code });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setName("");
      setCode("");
      list.refresh();
    } else {
      setFormError(result.error ?? "Erro ao criar profissão.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteProfession(Number(id))));
    list.refresh();
    list.setSelectedIds([]);
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
            placeholder="Buscar áreas de atuação"
          />
        </div>
        <div className="flex">
          <AddButton
            label="Adicionar área de atuação"
            onClick={() => setIsModalOpen(true)}
          />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      <div className="flex-1">
        <Table
          selected={list.selectedIds}
          loading={!list.loaded}
          error={list.error}
          data={list.items.map(toRow)}
          page={list.page}
          pageCount={list.pageCount}
          onPageChange={list.setPage}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Área de Atuação" },
            { key: "code", label: "Código" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={list.setSelectedIds}
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

export default function ProfessionsPage() {
  return (
    <Suspense>
      <Professions />
    </Suspense>
  );
}

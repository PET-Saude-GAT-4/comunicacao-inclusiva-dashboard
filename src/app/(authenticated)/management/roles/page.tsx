"use client";

import { useEffect, useState } from "react";
import PillTabs from "@/components/PillTabs/PillTabs";
import { MANAGEMENT_GROUP } from "@/config/navigation";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getRoles, createRole, deleteRole } from "@/services/roles";
import { RoleOutput } from "@/types/role";

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
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
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
    await Promise.all(selectedIds.map((id) => deleteRole(Number(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <PillTabs label={MANAGEMENT_GROUP.title} pages={MANAGEMENT_GROUP.pages} />
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

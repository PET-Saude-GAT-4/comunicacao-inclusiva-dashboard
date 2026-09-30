"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TabButton from "@/components/TabButton/TabButton";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import Pagination from "@/components/Pagination/Pagination";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
} from "react-icons/md";
import { getUsers, createUser, deleteUser } from "@/services/users";
import { getRoles } from "@/services/roles";
import { UserOutput } from "@/types/user";
import { RoleOutput } from "@/types/role";
import UserCard from "../../components/UserCard/UserCard";

function Users() {
  const [data, setData] = useState<UserOutput[]>([]);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<RoleOutput[]>([]);
  const [roleId, setRoleId] = useState<number>(0);

  const fetchData = () => getUsers().then((users) => setData(users));

  useEffect(() => {
    fetchData();
    getRoles().then(setRoles);
  }, []);

  const handleCreate = async () => {
    if (!email) {
      setFormError("Informe o email.");
      return;
    }
    if (!roleId || roleId === 0) {
      setFormError("Selecione uma permissão.");
      return;
    }
    const result = await createUser({ email, roleId });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setEmail("");
      setRoleId(0);
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao convidar usuário.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteUser(Number(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleDeleteOne = async (id: number) => {
    await deleteUser(id);
    setData((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <nav className="flex justify-between">
          <TabButton icon={MdPeople} active={true} />
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
          <TabButton
            icon={MdLocalPolice}
            active={false}
            onClick={() => redirect("/management/roles")}
          />
        </nav>
        <div className="flex w-full justify-around">{/* <SearchBar/> */}</div>
        <div className="flex">
          <AddButton onClick={() => setIsModalOpen(true)} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 auto-rows-max gap-4">
          {pageData.map((user) => (
            <div key={user.id} className="self-start">
              <UserCard
                user={user}
                onSelect={() => toggleSelection(user.id)}
                onDelete={() => handleDeleteOne(user.id)}
                isSelected={selectedIds.includes(user.id)}
              />
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center border-t border-outline-common py-sm bg-surface-primary">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={(nextPage) =>
                setPage(Math.min(Math.max(1, nextPage), pageCount))
              }
            />
          </div>
        )}
      </div>

      {/* <Table
          data={data}
          columns={[
            { key: "id", label: "ID" },
            { key: "email", label: "Usuário" },
            { key: "role", label: "Nível de Permissões" },
            { key: "createdAt", label: "Data de Ingresso" },
          ]}
          onSelectionChange={setSelectedIds}
        /> */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Usuário"
      >
        <div className="flex flex-col gap-sm">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="usuario@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-col">
            <label className="text-text-on-primary" htmlFor="roleId">
              Permissão
            </label>
            <select
              id="roleId"
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="border border-outline-common focus:border-primary-dark focus:outline-none focus:ring-1 focus:ring-primary-dark text-text-on-primary p-sm px-lg bg-surface-secondary rounded-md"
            >
              <option value={0} disabled>
                Selecione uma permissão
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <Button type="button" onClick={handleCreate}>
            Convidar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Users;

"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import TabButton from "@/components/TabButton/TabButton";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import {
  MdPeople,
  MdAssignmentInd,
  MdMedicalInformation,
  MdLocalPolice,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { getUsers, createUser, deleteUser } from "@/services/users";
import { UserOutput } from "@/types/user";
import UserCard from "../../components/UserCard/UserCard";

function Users() {
  const [data, setData] = useState<UserOutput[]>([]);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const fetchData = () => getUsers().then((users) => setData(users));

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    const result = await createUser({ email, password, role });
    if (result.success) {
      setIsModalOpen(false);
      setFormError(null);
      setEmail("");
      setPassword("");
      setRole("");
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar usuário.");
    }
  };

  const handleDelete = async () => {
    await Promise.all(selectedIds.map((id) => deleteUser(Number(id))));
    setData((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((page - 1) * pageSize, page * pageSize);
  const goToPage = (n: number) => setPage(Math.min(Math.max(1, n), pageCount));

  return (
    <div className="h-full w-full bg-surface-primary flex flex-col">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Usuários</p>
      </div>
      <div className="flex items-center justify-between p-sm text-text-on-primary border-b border-outline-common">
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
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-3 grid-rows-4 gap-4 p-4 h-fit">
          {pageData.map((user) => (
            <div key={user.id}>
              <UserCard user={user} />
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-1 border-t border-outline-common py-sm text-body-emph bg-surface-primary">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
              className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <MdChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-0.5">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={[
                    "grid h-8 min-w-8 place-items-center rounded-sm px-2 text-body transition-colors",
                    n === page
                      ? "font-bold text-primary-dark"
                      : "font-regular text-text-on-primary-variant hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page === pageCount}
              aria-label="Próxima página"
              className="grid h-8 w-8 place-items-center rounded-sm text-text-on-primary-variant hover:bg-surface-secondary disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <MdChevronRight size={20} />
            </button>
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
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            id="role"
            label="Permissão"
            type="text"
            placeholder="ex: admin"
            value={role}
            onChange={(e) => setRole(e.target.value)}
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

export default Users;

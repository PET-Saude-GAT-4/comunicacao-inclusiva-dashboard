"use client";

import { useEffect, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getTerms, createTerm, deleteTerm } from "@/services/terms";
import { getPictograms } from "@/services/pictograms";
import { getSignWritings } from "@/services/sign-writings";
import { TermOutput } from "@/types/term";
import { PictogramOutput } from "@/types/pictogram";
import { SignWritingOutput } from "@/types/sign-writing";
import Image from "next/image";
import Link from "next/link";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AssetPicker, { Asset } from "@/components/AssetPicker/AssetPicker";

type TermRow = {
  uuid: string;
  pictogramUrl: string;
  signWritingUrl: string;
  description: string;
  createdAt: string;
};

function formatList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function toRow(t: TermOutput): TermRow {
  return {
    uuid: t.uuid,
    pictogramUrl: t.pictogram.fileUrl,
    signWritingUrl: t.signWriting.fileUrl,
    description: t.description,
    createdAt: new Date(t.createdAt).toLocaleDateString("pt-BR"),
  };
}

function Terms() {
  const [data, setData] = useState<TermRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [description, setDescription] = useState("");
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);
  const [signWritings, setSignWritings] = useState<SignWritingOutput[]>([]);
  const [selectedPictogram, setSelectedPictogram] = useState<Asset>();
  const [selectedSignWriting, setSelectedSignWriting] = useState<Asset>();

  const fetchData = () => getTerms().then((rows) => setData(rows.map(toRow)));

  useEffect(() => {
    fetchData();
  }, []);

  const clearForm = () => {
    setDescription("");
    setDescriptionEdited(false);
    setSelectedPictogram(undefined);
    setSelectedSignWriting(undefined);
    setFormError(null);
  };

  // The pictogram's own description is the natural label for the pair, so it
  // seeds the field. Until the user types something of their own, which then
  // survives picking a different pictogram.
  const handleSelectPictogram = (pictogram: Asset) => {
    setSelectedPictogram(pictogram);
    if (!descriptionEdited) setDescription(pictogram.description);
  };

  const openModal = () => {
    getPictograms().then(setPictograms);
    getSignWritings().then(setSignWritings);
    setIsModalOpen(true);
  };

  const handleCreate = async () => {
    if (!description || !selectedPictogram || !selectedSignWriting) {
      setFormError("Descrição, pictograma e SignWriting são obrigatórios.");
      return;
    }
    const result = await createTerm({
      description,
      pictogramUuid: selectedPictogram.uuid,
      signWritingUuid: selectedSignWriting.uuid,
    });
    if (result.success) {
      setIsModalOpen(false);
      clearForm();
      fetchData();
    } else {
      setFormError(result.error ?? "Erro ao criar termo.");
    }
  };

  const missing = [
    !description.trim() && "uma descrição",
    !selectedPictogram && "um pictograma",
    !selectedSignWriting && "uma escrita de sinais",
  ].filter((m): m is string => typeof m === "string");

  const canSave = missing.length === 0;

  const handleDelete = async () => {
    const results = await Promise.all(
      selectedIds.map(async (id) => ({
        uuid: String(id),
        result: await deleteTerm(String(id)),
      })),
    );
    // Rows that the API refused to remove stay in the table.
    const removed = results.filter((r) => r.result.success).map((r) => r.uuid);
    const failure = results.find((r) => !r.result.success);
    setData((prev) => prev.filter((item) => !removed.includes(item.uuid)));
    setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  return (
    <div className="min-h-screen w-full bg-surface-primary">
      <div className="text-text-on-primary border-b border-outline-common text-heading px-lg py-md">
        <p>Termos</p>
      </div>
      <div className="flex items-center justify-end p-sm text-text-on-primary border-b border-outline-common">
        <div className="flex">
          <AddButton onClick={openModal} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      {deleteError && (
        <p className="text-sm text-red-500 px-lg py-sm border-b border-outline-common">
          {deleteError}
        </p>
      )}
      <div className="flex-1">
        <Table
          data={data}
          columns={[
            { key: "uuid", label: "Código de Termo" },
            {
              key: "pictogramUrl",
              label: "Pictograma",
              render: (value) => (
                <Image
                  src={String(value)}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain rounded"
                />
              ),
            },
            {
              key: "signWritingUrl",
              label: "SignWriting",
              render: (value) => (
                <Image
                  src={String(value)}
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain rounded"
                />
              ),
            },
            { key: "description", label: "Descrição" },
            { key: "createdAt", label: "Data de Criação" },
          ]}
          onSelectionChange={setSelectedIds}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearForm();
        }}
        title="Novo Termo"
      >
        <div className="flex flex-col gap-md w-250 m-xl mb-xs">
          <Input
            id="description"
            label="Descrição"
            type="text"
            placeholder="ex: Cachorro"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDescriptionEdited(true);
            }}
          />
          <div className="flex flex-row gap-xxl">
            <AssetPicker items={pictograms} onSelect={handleSelectPictogram} />
            <AssetPicker
              id="sign-writing-filter"
              label="SignWritings Disponíveis:"
              items={signWritings}
              onSelect={setSelectedSignWriting}
            />
            <div className="flex flex-col w-full gap-md">
              <Input
                id="pictogramUuid"
                label="Código do Pictograma"
                type="text"
                disabled
                placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
                value={selectedPictogram?.uuid || ""}
              />
              <Input
                id="signWritingUuid"
                label="Código do SignWriting"
                type="text"
                disabled
                placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
                value={selectedSignWriting?.uuid || ""}
              />
              <div className="flex justify-center gap-md">
                {selectedPictogram ? (
                  <Image
                    src={selectedPictogram.fileUrl}
                    alt=""
                    width="120"
                    height="120"
                    className="border border-outline-common object-contain rounded-md"
                  />
                ) : (
                  <div className="border border-outline-common flex items-center justify-center rounded-md w-30 h-30">
                    <p className="text-text-on-primary text-center text-sm">
                      Sem pictograma
                    </p>
                  </div>
                )}
                {selectedSignWriting ? (
                  <Image
                    src={selectedSignWriting.fileUrl}
                    alt=""
                    width="120"
                    height="120"
                    className="border border-outline-common object-contain rounded-md"
                  />
                ) : (
                  <div className="border border-outline-common flex items-center justify-center rounded-md w-30 h-30">
                    <p className="text-text-on-primary text-center text-sm">
                      Sem SignWriting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <div className="flex items-center justify-end gap-md">
            {!canSave && (
              <p className="text-sm text-text-on-primary-variant text-right">
                Falta escolher {formatList(missing)}.{" "}
                {!selectedSignWriting &&
                  (signWritings.length === 0 ? (
                    <>
                      Nenhum SignWriting foi cadastrado ainda —{" "}
                      <Link
                        href="/sign-writings"
                        className="underline hover:text-text-on-primary"
                      >
                        cadastre um
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Escolha uma escrita de sinais na lista, ou{" "}
                      <Link
                        href="/sign-writings"
                        className="underline hover:text-text-on-primary"
                      >
                        cadastre uma nova
                      </Link>
                      .
                    </>
                  ))}
              </p>
            )}
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canSave}
              className="disabled:cursor-not-allowed"
            >
              Criar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Terms;

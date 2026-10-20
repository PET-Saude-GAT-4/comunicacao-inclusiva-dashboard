"use client";

import { Suspense, useState } from "react";
import AddButton from "@/components/AddButton/AddButton";
import PillTabs from "@/components/PillTabs/PillTabs";
import { TERM_SECTIONS } from "@/config/navigation";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import SearchBar from "@/components/SearchBar/SearchBar";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import AssetCard from "../components/AssetCard/AssetCard";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { getTermPage, createTerm, deleteTerm } from "@/services/terms";
import { getPictograms } from "@/services/pictograms";
import { getSignWritings } from "@/services/sign-writings";
import { PictogramOutput } from "@/types/pictogram";
import { SignWritingOutput } from "@/types/sign-writing";
import Image from "next/image";
import Link from "next/link";
import RemoveButton from "@/components/RemoveButton/RemoveButton";
import AssetPicker, { Asset } from "@/components/AssetPicker/AssetPicker";
import { formatList } from "@/utils/text";

function Terms() {
  const list = usePaginatedList("terms", getTermPage, { pageSize: 12 });
  const { selectedIds, setSelectedIds } = list;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [pictograms, setPictograms] = useState<PictogramOutput[]>([]);
  const [signWritings, setSignWritings] = useState<SignWritingOutput[]>([]);
  const [selectedPictogram, setSelectedPictogram] = useState<Asset>();
  const [selectedSignWriting, setSelectedSignWriting] = useState<Asset>();

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
      list.refresh();
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
    const failure = results.find((r) => !r.result.success);
    list.refresh();
    setSelectedIds([]);
    setDeleteError(failure?.result.error ?? null);
  };

  const handleDeleteOne = async (uuid: string) => {
    const result = await deleteTerm(uuid);
    if (result.success) {
      list.refresh();
      setSelectedIds((prev) =>
        prev.filter((selectedId) => selectedId !== uuid),
      );
    }
    setDeleteError(result.success ? null : (result.error ?? null));
  };

  const toggleSelection = (uuid: string) => {
    setSelectedIds((prev) =>
      prev.includes(uuid)
        ? prev.filter((selectedId) => selectedId !== uuid)
        : [...prev, uuid],
    );
  };

  return (
    <div className="flex w-full flex-col gap-lg">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-lg py-md text-text-on-primary">
        <PillTabs label="Termos" pages={TERM_SECTIONS} />
        <div className="mx-lg w-100">
          <SearchBar
            value={list.search}
            onChange={list.setSearch}
            placeholder="Buscar termos"
          />
        </div>
        <div className="flex">
          <AddButton onClick={openModal} />
          <RemoveButton
            active={selectedIds.length > 0}
            onClick={handleDelete}
          />
        </div>
      </div>
      {deleteError && (
        <p className="px-4 text-sm text-red-500">{deleteError}</p>
      )}
      <div className="flex flex-col">
        <div className="grid grid-cols-6 gap-4 p-4">
          {list.items.map((term) => (
            <div key={term.uuid}>
              {/* Terms record no author. */}
              <AssetCard
                title={term.description}
                uuid={term.uuid}
                createdAt={term.createdAt}
                images={[
                  { src: term.pictogram.fileUrl, label: "Pictograma" },
                  { src: term.signWriting.fileUrl, label: "SignWriting" },
                ]}
                authorEmail={null}
                onSelect={() => toggleSelection(term.uuid)}
                onDelete={() => handleDeleteOne(term.uuid)}
                isSelected={selectedIds.includes(term.uuid)}
              />
            </div>
          ))}
        </div>
        {list.loaded && list.items.length === 0 && (
          <p className="py-lg text-center text-text-secondary">
            Nenhum item encontrado
          </p>
        )}
        <div className="flex items-center justify-center py-4 rounded-md outline-1 outline-outline-common bg-white">
          <Pagination
            page={list.page}
            pageCount={list.pageCount}
            onPageChange={list.setPage}
          />
        </div>
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

export default function TermsPage() {
  return (
    <Suspense>
      <Terms />
    </Suspense>
  );
}

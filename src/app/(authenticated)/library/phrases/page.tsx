"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Table from "@/components/Table/Table";
import SearchBar from "@/components/SearchBar/SearchBar";
import ListToolbar from "@/components/ListToolbar/ListToolbar";
import PhraseTermsPreview from "@/components/PhraseTermsPreview/PhraseTermsPreview";
import { getPublicPhrases } from "@/services/phrases";
import { getSessionUser } from "@/services/auth";
import { PhraseOutput } from "@/types/phrase";
import { TermPlacementOutput } from "@/types/term";
import { SessionUser } from "@/types/session";
import AuthorEmail from "../../components/AuthorEmail/AuthorEmail";

// Defined once so SearchBar, which filters whenever it changes, filters only
// when the list or the query does.
const phraseSearchText = (phrase: PhraseOutput) => phrase.description;

type PhraseRow = PhraseOutput & { itemCount: number };

function toRow(phrase: PhraseOutput): PhraseRow {
  return { ...phrase, itemCount: phrase.terms.length };
}

function LibraryPhrases() {
  const router = useRouter();
  const [phrases, setPhrases] = useState<PhraseOutput[]>([]);
  // GET /public/phrases is not paginated, so this page searches the list it
  // already has instead of asking the API.
  const [filteredPhrases, setFilteredPhrases] = useState<PhraseOutput[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // The public list also carries published phrases kept out of the library,
    // which sync to the app only for their board recommendations.
    getPublicPhrases()
      .then((all) => setPhrases(all.filter((phrase) => phrase.listedInLibrary)))
      .catch(() => setError("Erro ao buscar frases."))
      .finally(() => setLoaded(true));
    getSessionUser().then(setUser);
  }, []);

  const canReadUsers = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="flex w-full flex-col gap-lg">
      <ListToolbar
        search={
          <SearchBar
            data={phrases}
            onResults={setFilteredPhrases}
            getSearchText={phraseSearchText}
            placeholder="Buscar frases"
          />
        }
      />
      <div>
        <Table
          loading={!loaded}
          error={error}
          data={filteredPhrases.map(toRow)}
          columns={[
            { key: "description", label: "Descrição" },
            {
              key: "terms",
              label: "Frase",
              render: (value) => (
                <PhraseTermsPreview terms={value as TermPlacementOutput[]} />
              ),
            },
            { key: "itemCount", label: "Itens" },
            {
              key: "authorUuid",
              label: "Autor",
              render: (_value, phrase) => (
                <AuthorEmail uuid={phrase.authorUuid} lookup={canReadUsers} />
              ),
            },
            {
              key: "createdAt",
              label: "Data de Criação",
              render: (value) =>
                new Date(String(value)).toLocaleDateString("pt-BR"),
            },
          ]}
          onRowClick={(phrase) =>
            router.push(`/library/phrases/${phrase.uuid}`)
          }
        />
      </div>
    </div>
  );
}

export default LibraryPhrases;

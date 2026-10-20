"use client";

import { MdPerson } from "react-icons/md";
import { useAuthorEmail } from "@/hooks/useAuthorEmail";

type Props = {
  uuid: string | null;
  // Off for viewers, who may not read users, so they are spared a lookup the
  // API would refuse.
  lookup?: boolean;
};

// An author cell in a table of boards. Each one resolves its own email, so
// only the authors of the rows on screen are ever requested.
export default function AuthorEmail({ uuid, lookup = true }: Props) {
  const email = useAuthorEmail(lookup ? uuid : null);

  return (
    <div className="flex items-center gap-sm">
      <MdPerson className="text-gray-400" size={18} />
      <p>{email ?? "Desconhecido"}</p>
    </div>
  );
}

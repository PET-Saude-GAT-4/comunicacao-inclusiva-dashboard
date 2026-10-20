"use client";

import { useAuthorEmail } from "@/hooks/useAuthorEmail";
import AuthorLabel from "../AuthorLabel/AuthorLabel";

type Props = {
  uuid: string | null;
  // Off for viewers, who may not read users, so they are spared a lookup the
  // API would refuse.
  lookup?: boolean;
};

// An author cell in a table of boards that come without the author's email,
// like /public/boards. Each one resolves its own email, so only the authors of
// the rows on screen are ever requested.
export default function AuthorEmail({ uuid, lookup = true }: Props) {
  const email = useAuthorEmail(lookup ? uuid : null);

  return <AuthorLabel email={email} />;
}

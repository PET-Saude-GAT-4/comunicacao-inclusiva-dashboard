type Props = {
  loaded: boolean;
  error: string | null;
  isEmpty: boolean;
};

// What a card grid shows in place of its cards: the reason the list could not
// load, or that it loaded with nothing in it. Table renders the same messages
// inside its own body.
export default function ListStatus({ loaded, error, isEmpty }: Props) {
  if (error) {
    return <p className="py-lg text-center text-red-500">{error}</p>;
  }

  if (loaded && isEmpty) {
    return (
      <p className="py-lg text-center text-text-secondary">
        Nenhum item encontrado
      </p>
    );
  }

  return null;
}

import Thumbnail from "@/components/Thumbnail/Thumbnail";
import { TermPlacementOutput } from "@/types/term";

const PREVIEW_LIMIT = 4;

// A phrase's first pictograms, in order, for a table cell. Capped so a long
// phrase cannot blow out the row height; the rest show as a count.
export default function PhraseTermsPreview({
  terms,
}: {
  terms: TermPlacementOutput[];
}) {
  const extra = terms.length - PREVIEW_LIMIT;

  return (
    <div className="flex items-center gap-xs">
      {terms.slice(0, PREVIEW_LIMIT).map((placement) => (
        <Thumbnail
          key={placement.uuid}
          src={placement.pictogram.fileUrl}
          size={32}
          className="rounded"
        />
      ))}
      {extra > 0 && (
        <span className="text-text-on-primary-variant text-body">
          +{extra}
        </span>
      )}
    </div>
  );
}

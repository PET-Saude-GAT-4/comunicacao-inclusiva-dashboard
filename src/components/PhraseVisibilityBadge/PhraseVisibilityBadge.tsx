import Badge, { BadgeVariant } from "@/components/Badge/Badge";
import {
  PHRASE_VISIBILITIES,
  PhraseVisibility,
} from "@/utils/phrase-visibility";

const variantByVisibility: Record<PhraseVisibility, BadgeVariant> = {
  draft: "neutral",
  hidden: "secondary",
  listed: "success",
};

export default function PhraseVisibilityBadge({
  visibility,
}: {
  visibility: PhraseVisibility;
}) {
  return (
    <Badge variant={variantByVisibility[visibility]}>
      {PHRASE_VISIBILITIES[visibility].label}
    </Badge>
  );
}

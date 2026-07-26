import type { SourceBox } from "@/data/types";

/**
 * The one coordinate system shared by the printed document and the overlay
 * drawn on top of it.
 *
 * A source box is stored as a percentage of the *field area* — the part of
 * the page below the form header. The print route lays boxes out with these
 * numbers; the viewer positions its highlights with the same ones. Because
 * both sides measure against the same container, the highlight lands on the
 * value no matter what size the page is rendered at.
 */

/** Height of the form header band, as a percentage of the page. */
export const HEADER_BAND_PCT = 14;

export function boxPosition(box: SourceBox): React.CSSProperties {
  return {
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    minHeight: `${box.h}%`,
  };
}

/** The field area: everything below the header band. */
export const FIELD_AREA_STYLE: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: `${HEADER_BAND_PCT}%`,
  bottom: 0,
};

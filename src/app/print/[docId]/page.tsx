import { notFound } from "next/navigation";
import { heroDocuments } from "@/data/hero";
import { FIELD_AREA_STYLE, boxPosition } from "@/lib/doc-geometry";
import type { SourceBox, TaxDocument } from "@/data/types";

/**
 * The source artwork for the fabricated tax documents.
 *
 * `docs/make-pdfs.mjs` prints these pages to real PDFs in
 * `public/documents/`, which is what the review workspace then renders.
 * Generating the artwork from the same data the app uses means the printed
 * page and the provenance overlay can never disagree about where a value
 * sits — the alternative is hand-maintaining coordinates twice.
 *
 * This route is build-time tooling, not part of the demo. Nothing links here.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

/**
 * Only the hero documents carry real box coordinates; the thousands of
 * seeded filler documents have nothing to draw, so they aren't printable.
 */
const PRINTABLE = heroDocuments.filter((d) => d.pages > 0 && d.boxes.length > 0);

export function generateStaticParams() {
  return PRINTABLE.map((d) => ({ docId: d.id }));
}

/** Forms are ruled and monospaced; a shop receipt is not. */
function isReceipt(doc: TaxDocument): boolean {
  return doc.kind === "Receipt";
}

function FormHeader({ doc, page }: { doc: TaxDocument; page: number }) {
  if (isReceipt(doc)) {
    return (
      <header className="flex h-[14%] flex-col justify-center border-b-2 border-double border-[#c9c2b4] px-[6%]">
        <p className="font-display text-[22px] italic text-[#2b2b2b]">{doc.issuer}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7c766b]">
          Official donation receipt · Tax year 2025
        </p>
      </header>
    );
  }

  return (
    <header className="flex h-[14%] items-stretch border-b-2 border-[#1c2321]">
      <div className="flex w-[62%] flex-col justify-center border-r border-[#1c2321] px-[3%]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5f6b66]">
          Department of the Treasury — Internal Revenue Service
        </p>
        <p className="mt-1 font-display text-[26px] leading-none text-[#1c2321]">
          Form {doc.kind}
        </p>
        <p className="font-mono text-[10px] text-[#5f6b66]">{doc.issuer}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center px-[3%]">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5f6b66]">
          Tax year
        </p>
        <p className="font-mono text-[30px] leading-none text-[#1c2321]">2025</p>
        <p className="mt-1 font-mono text-[9px] text-[#5f6b66]">
          OMB No. 1545-0008 · Page {page} of {doc.pages}
        </p>
      </div>
    </header>
  );
}

function FieldBox({ box, receipt }: { box: SourceBox; receipt: boolean }) {
  return (
    <div
      className={
        receipt
          ? "absolute px-2 py-1.5"
          : "absolute border border-[#1c2321] bg-white px-2 py-1"
      }
      style={boxPosition(box)}
    >
      <p
        className={
          receipt
            ? "text-[9px] uppercase tracking-[0.16em] text-[#8a8375]"
            : "font-mono text-[8.5px] uppercase leading-tight tracking-[0.1em] text-[#5f6b66]"
        }
      >
        {box.label}
      </p>
      <p
        className={
          receipt
            ? "mt-0.5 whitespace-pre-line font-display text-[17px] italic leading-snug text-[#2b2b2b]"
            : "mt-0.5 whitespace-pre-line font-mono text-[12px] leading-snug text-[#1c2321]"
        }
      >
        {box.value}
      </p>
    </div>
  );
}

function DocumentPage({ doc, page }: { doc: TaxDocument; page: number }) {
  const receipt = isReceipt(doc);
  const boxes = doc.boxes.filter((b) => b.page === page);

  return (
    <section
      className={`print-page relative overflow-hidden ${
        receipt ? "bg-[#fffdf6]" : "bg-white"
      }`}
    >
      <FormHeader doc={doc} page={page} />

      <div style={FIELD_AREA_STYLE}>
        {boxes.map((box) => (
          <FieldBox key={box.id} box={box} receipt={receipt} />
        ))}
      </div>

      <footer className="absolute inset-x-0 bottom-0 flex justify-between px-[3%] pb-[1.5%] font-mono text-[8px] text-[#8a8375]">
        <span>
          {receipt
            ? "Retain for your records."
            : "This information is being furnished to the Internal Revenue Service."}
        </span>
        <span>Fabricated for the Meridian prototype — not a real tax document.</span>
      </footer>
    </section>
  );
}

export default async function PrintDocument({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  const doc = PRINTABLE.find((d) => d.id === docId);
  if (!doc) notFound();

  return (
    <>
      {Array.from({ length: doc.pages }, (_, i) => (
        <DocumentPage key={i} doc={doc} page={i + 1} />
      ))}
    </>
  );
}

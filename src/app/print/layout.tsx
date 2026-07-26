/**
 * Print-only frame for the fabricated documents. Each child section is one
 * US Letter page with no margins, so headless Chrome prints it edge to edge.
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @page { size: Letter; margin: 0; }
        html, body { background: #ffffff; margin: 0; }
        .print-page {
          width: 8.5in;
          height: 11in;
          break-after: page;
        }
        .print-page:last-child { break-after: auto; }
      `}</style>
      {children}
    </>
  );
}

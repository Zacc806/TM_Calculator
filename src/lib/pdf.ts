/**
 * Renders an already-mounted DOM node to a downloadable PDF.
 * Uses the html2canvas raster path, so system Cyrillic fonts embed correctly
 * without registering TTF fonts in jsPDF.
 *
 * html2pdf.js (jsPDF + html2canvas, ~400 kB) is imported lazily so it stays out
 * of the initial bundle and only loads when the user exports a PDF.
 */
export async function exportElementToPdf(element: HTMLElement, filename: string): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");
  return html2pdf()
    .set({
      margin: [12, 12, 12, 12],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save();
}

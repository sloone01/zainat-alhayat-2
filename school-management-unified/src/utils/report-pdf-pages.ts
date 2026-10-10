/** Top and bottom space kept on every PDF page, including pages after the first. */
const MARGIN_MM = 14

type PdfDoc = {
  internal: { pageSize: { getWidth(): number; getHeight(): number } }
  addPage: () => void
  addImage: (
    data: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => void
}

/**
 * Place a captured report on A4 pages with a top and bottom margin.
 * A table row that would be cut is moved onto the next page.
 */
export function paintReportPdfPages(pdf: PdfDoc, canvas: HTMLCanvasElement, host: HTMLElement) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const hostW = Math.max(1, host.offsetWidth || host.scrollWidth)
  const hostH = Math.max(1, host.scrollHeight || host.offsetHeight)
  const mmPerPx = pageW / hostW
  const usablePx = Math.max(1, (pageH - MARGIN_MM * 2) / mmPerPx)
  const scaleY = canvas.height / hostH

  const hostTop = host.getBoundingClientRect().top
  const rows = [...host.querySelectorAll('tr')]
    .map((row) => {
      const rect = row.getBoundingClientRect()
      return { top: rect.top - hostTop, bottom: rect.bottom - hostTop }
    })
    .filter((row) => row.bottom > row.top + 0.5)
    .sort((a, b) => a.top - b.top)

  let cursor = 0
  let pageIndex = 0
  while (cursor < hostH - 1 && pageIndex < 200) {
    let end = Math.min(hostH, cursor + usablePx)
    const split = rows.find((row) => row.top > cursor + 4 && row.top < end - 1 && row.bottom > end + 0.5)
    if (split) end = split.top
    if (end <= cursor + 1) end = Math.min(hostH, cursor + usablePx)

    const srcY = Math.max(0, Math.min(canvas.height - 1, Math.round(cursor * scaleY)))
    const srcH = Math.max(1, Math.min(canvas.height - srcY, Math.round((end - cursor) * scaleY)))
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = srcH
    const ctx = slice.getContext('2d')
    if (!ctx) break
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, slice.width, slice.height)
    ctx.drawImage(canvas, 0, srcY, canvas.width, Math.min(srcH, canvas.height - srcY), 0, 0, canvas.width, srcH)

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, MARGIN_MM, pageW, (end - cursor) * mmPerPx)

    cursor = end
    pageIndex += 1
  }
}

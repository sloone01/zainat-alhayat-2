import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

export type AttendanceReport = {
  title: string
  schoolName: string
  rtl: boolean
  meta: { label: string; value: string }[]
  summary: { label: string; value: string }[]
  columns: string[]
  rows: string[][]
}

const INK = '000000'
const HEAD = 'D9D9D9'
const PAGE = 9638

const line = { style: BorderStyle.SINGLE, size: 4, color: '000000' } as const
const grid = { top: line, bottom: line, left: line, right: line }

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

function run(text: string, bold = false, size = 22) {
  return new TextRun({
    text: text || ' ',
    bold,
    size,
    font: 'Arial',
    color: INK,
    rightToLeft: hasArabic(text),
  })
}

function paragraph(children: TextRun[], rtl: boolean, spacing?: { before?: number; after?: number }) {
  return new Paragraph({
    bidirectional: rtl,
    alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing,
    children,
  })
}

function cell(text: string, width: number, rtl: boolean, header = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: grid,
    shading: header ? { type: ShadingType.CLEAR, fill: HEAD } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [paragraph([run(text, header, 21)], rtl)],
  })
}

function table(columnWidths: number[], rows: TableRow[], rtl: boolean) {
  return new Table({
    width: { size: PAGE, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: rtl,
    borders: { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line },
    rows,
  })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function downloadDocx(model: AttendanceReport, filename: string) {
  const align = model.rtl
  const summaryWidths = [6800, 2838]
  const count = Math.max(model.columns.length, 1)
  const studentWidths = Array.from({ length: count }, (_, index) =>
    index === 0 ? 3800 : Math.floor((PAGE - 3800) / (count - 1)),
  )
  const used = studentWidths.reduce((sum, width) => sum + width, 0)
  studentWidths[studentWidths.length - 1] += PAGE - used

  const summaryRows = model.summary.map(
    (row) =>
      new TableRow({
        children: [cell(row.label, summaryWidths[0], align), cell(row.value, summaryWidths[1], align)],
      }),
  )
  const studentHeader = new TableRow({
    tableHeader: true,
    children: model.columns.map((label, index) => cell(label, studentWidths[index], align, true)),
  })
  const studentBody = model.rows.map(
    (row) =>
      new TableRow({
        children: model.columns.map((_, index) => cell(row[index] ?? '', studentWidths[index], align)),
      }),
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children: [
          paragraph([run(model.title, true, 32)], align, { after: 80 }),
          ...(model.schoolName
            ? [paragraph([run(model.schoolName, false, 22)], align, { after: 200 })]
            : []),
          ...model.meta.map((row) =>
            paragraph([run(`${row.label}: `, true, 22), run(row.value, false, 22)], align, { after: 40 }),
          ),
          paragraph([run('')], align, { after: 160 }),
          table(summaryWidths, summaryRows, align),
          paragraph([run('')], align, { before: 280, after: 80 }),
          table(studentWidths, [studentHeader, ...studentBody], align),
        ],
      },
    ],
  })

  triggerDownload(await Packer.toBlob(doc), `${filename}.docx`)
}

function sheetHtml(model: AttendanceReport): string {
  const align = model.rtl ? 'right' : 'left'
  const meta = model.meta
    .map(
      (row) =>
        `<p class="meta"><b>${esc(row.label)}:</b> <span class="val">${esc(row.value)}</span></p>`,
    )
    .join('')
  const summary = model.summary
    .map(
      (row) =>
        `<tr><td>${esc(row.label)}</td><td class="num">${esc(row.value)}</td></tr>`,
    )
    .join('')
  const head = model.columns.map((label) => `<th>${esc(label)}</th>`).join('')
  const body = model.rows
    .map((row) => `<tr>${model.columns.map((_, index) => `<td>${esc(row[index] ?? '')}</td>`).join('')}</tr>`)
    .join('')
  const school = model.schoolName ? `<p class="school">${esc(model.schoolName)}</p>` : ''

  return `
    <style>
      .sheet { width: 794px; padding: 64px 72px; background: #fff; color: #000; font-family: Arial, "Noto Naskh Arabic", sans-serif; }
      h1 { margin: 0 0 8px; font-size: 22px; font-weight: 700; text-align: ${align}; }
      .school { margin: 0 0 18px; font-size: 14px; text-align: ${align}; }
      .meta { margin: 0 0 4px; font-size: 14px; line-height: 1.5; text-align: ${align}; }
      .val, .num { unicode-bidi: isolate; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
      th, td { border: 1px solid #000; padding: 6px 8px; text-align: ${align}; vertical-align: top; }
      th { background: #d9d9d9; font-weight: 700; }
    </style>
    <div class="sheet" dir="${model.rtl ? 'rtl' : 'ltr'}">
      <h1>${esc(model.title)}</h1>
      ${school}
      ${meta}
      <table><tbody>${summary}</tbody></table>
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `
}

async function downloadPdf(model: AttendanceReport, filename: string) {
  const host = document.createElement('div')
  host.setAttribute('dir', model.rtl ? 'rtl' : 'ltr')
  host.style.cssText = 'position:fixed;left:-14000px;top:0;z-index:-1;background:#ffffff;'
  host.innerHTML = sheetHtml(model)
  document.body.appendChild(host)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    const img = canvas.toDataURL('image/jpeg', 0.92)
    let heightLeft = imgH
    let y = 0
    pdf.addImage(img, 'JPEG', 0, y, imgW, imgH)
    heightLeft -= pageH
    while (heightLeft > 8) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(img, 'JPEG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }
    pdf.save(`${filename}.pdf`)
  } finally {
    host.remove()
  }
}

export async function downloadAttendanceReport(
  model: AttendanceReport,
  format: 'pdf' | 'word',
  filename: string,
) {
  if (format === 'pdf') await downloadPdf(model, filename)
  else await downloadDocx(model, filename)
}

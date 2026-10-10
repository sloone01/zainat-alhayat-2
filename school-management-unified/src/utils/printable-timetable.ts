import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

export type PrintableCell = {
  title: string
  detail: string
  tone: 'class' | 'break' | 'empty'
}

export type PrintableTimetable = {
  title: string
  schoolName: string
  groupName: string
  corner: string
  notesLabel: string
  rtl: boolean
  columns: string[]
  rows: { day: string; cells: PrintableCell[] }[]
  notes: string[]
}

const BLUE = '1D4E89'
const LINE = '7EB6E0'
const HEAD = 'E7F5FC'
const DAY = 'F4FBFE'
const BREAK = 'F3F4F6'
const INK = '16324F'
const MUTED = '5B7C9A'

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function sheetHtml(model: PrintableTimetable): string {
  const cols = model.columns.length
  const headerFont = cols > 8 ? 11 : 13
  const cellFont = cols > 8 ? 12 : 14
  const headers = model.columns
    .map((label) => `<th>${esc(label).replace(/\n/g, '<br>')}</th>`)
    .join('')
  const body = model.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          if (cell.tone === 'break') return '<td class="break"></td>'
          if (!cell.title && !cell.detail) return '<td></td>'
          const detail = cell.detail ? `<div class="meta">${esc(cell.detail)}</div>` : ''
          return `<td><div class="sub">${esc(cell.title)}</div>${detail}</td>`
        })
        .join('')
      return `<tr><th>${esc(row.day)}</th>${cells}</tr>`
    })
    .join('')
  const printedNotes = model.notes.map((note) => `<div class="note">${esc(note)}</div>`).join('')
  const rules = Array.from({ length: 4 }, () => '<div class="rule"></div>').join('')
  const dir = model.rtl ? 'rtl' : 'ltr'
  const school = model.schoolName ? `<p class="school">${esc(model.schoolName)}</p>` : ''
  const group = model.groupName ? `<p class="group">${esc(model.groupName)}</p>` : ''

  return `<div class="sheet" dir="${dir}">
    <h1>${esc(model.title)}</h1>
    ${school}
    ${group}
    <table>
      <thead><tr><th class="corner">${esc(model.corner)}</th>${headers}</tr></thead>
      <tbody>${body}</tbody>
    </table>
    <section class="notes">
      <h2>${esc(model.notesLabel)}</h2>
      ${printedNotes}
      ${rules}
    </section>
    <style>
      .sheet {
        width: 1123px;
        height: 794px;
        box-sizing: border-box;
        padding: 28px 36px 22px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        color: #${INK};
        font-family: var(--fk-font-ui), Tahoma, Arial, sans-serif;
      }
      .sheet h1 {
        margin: 0;
        text-align: center;
        font-size: 32px;
        font-weight: 800;
        color: #${BLUE};
        letter-spacing: ${model.rtl ? '0' : '0.08em'};
      }
      .school, .group { margin: 0; text-align: center; }
      .school { margin-top: 4px; font-size: 13px; color: #${MUTED}; }
      .group { margin: 4px 0 12px; font-size: 16px; font-weight: 700; }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        flex: 1;
      }
      th, td {
        border: 1.5px solid #${LINE};
        text-align: center;
        vertical-align: middle;
        padding: 4px;
        font-size: ${headerFont}px;
        font-weight: 700;
        color: #${BLUE};
      }
      thead th, tbody th { background: #${HEAD}; }
      tbody th { width: 108px; background: #${DAY}; font-size: ${cellFont}px; }
      td { font-weight: 600; color: #${INK}; background: #ffffff; }
      td .sub { font-size: ${cellFont}px; font-weight: 700; line-height: 1.25; }
      td .meta { margin-top: 2px; font-size: ${Math.max(headerFont - 1, 10)}px; font-weight: 500; color: #${MUTED}; }
      td.break { background: #${BREAK}; }
      .notes { margin-top: 14px; }
      .notes h2 {
        margin: 0 0 6px;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: ${model.rtl ? '0' : '0.12em'};
        color: #${BLUE};
      }
      .note { font-size: 12px; line-height: 1.35; font-weight: 600; }
      .rule { height: 18px; border-bottom: 1px solid #9bb8d3; }
    </style>
  </div>`
}

async function downloadPdf(model: PrintableTimetable, filename: string) {
  const host = document.createElement('div')
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
      width: 1123,
      height: 794,
      windowWidth: 1123,
    })
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, pageH)
    pdf.save(`${filename}.pdf`)
  } finally {
    host.remove()
  }
}

const thin = { style: BorderStyle.SINGLE, size: 8, color: LINE } as const
const borders = { top: thin, bottom: thin, left: thin, right: thin }

function run(text: string, opts: { bold?: boolean; size?: number; color?: string; rtl?: boolean }) {
  return new TextRun({
    text,
    bold: opts.bold,
    size: opts.size ?? 18,
    font: 'Arial',
    color: opts.color ?? INK,
    rightToLeft: opts.rtl,
  })
}

function para(
  children: TextRun[],
  align: (typeof AlignmentType)[keyof typeof AlignmentType],
  spacing?: { before?: number; after?: number },
) {
  return new Paragraph({ alignment: align, spacing, children })
}

function cell(paragraphs: Paragraph[], width: number, fill: string) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: 'center',
    borders,
    shading: { type: ShadingType.CLEAR, fill },
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    children: paragraphs.length ? paragraphs : [new Paragraph('')],
  })
}

async function downloadDocx(model: PrintableTimetable, filename: string) {
  const pageWidth = 15840
  const dayWidth = 1800
  const colCount = Math.max(model.columns.length, 1)
  const slotWidth = Math.floor((pageWidth - dayWidth) / colCount)
  const columns = model.columns.length ? model.columns : ['']
  const headerSize = colCount > 8 ? 14 : 16
  const bodySize = colCount > 8 ? 14 : 18
  const align = AlignmentType.CENTER

  const header = new TableRow({
    tableHeader: true,
    height: { value: 500, rule: HeightRule.ATLEAST },
    children: [
      cell([para([run(model.corner, { bold: true, size: headerSize, color: BLUE, rtl: model.rtl })], align)], dayWidth, HEAD),
      ...columns.map((label) =>
        cell(
          label.split('\n').map((line) => para([run(line, { bold: true, size: headerSize, color: BLUE, rtl: model.rtl })], align)),
          slotWidth,
          HEAD,
        ),
      ),
    ],
  })

  const body = model.rows.map((row) => {
    const cells = (row.cells.length ? row.cells : [{ title: '', detail: '', tone: 'empty' as const }]).map((item) => {
      if (item.tone === 'break') return cell([new Paragraph('')], slotWidth, BREAK)
      const lines: Paragraph[] = []
      if (item.title) lines.push(para([run(item.title, { bold: true, size: bodySize, rtl: model.rtl })], align))
      if (item.detail) lines.push(para([run(item.detail, { size: Math.max(bodySize - 4, 12), color: MUTED, rtl: model.rtl })], align))
      return cell(lines, slotWidth, 'FFFFFF')
    })
    return new TableRow({
      height: { value: 700, rule: HeightRule.ATLEAST },
      children: [
        cell([para([run(row.day, { bold: true, size: bodySize, color: BLUE, rtl: model.rtl })], align)], dayWidth, DAY),
        ...cells,
      ],
    })
  })

  const noteParas = [
    new Paragraph({
      spacing: { before: 280, after: 80 },
      children: [run(model.notesLabel, { bold: true, size: 22, color: BLUE, rtl: model.rtl })],
    }),
    ...model.notes.map(
      (note) =>
        new Paragraph({
          spacing: { after: 40 },
          children: [run(note, { size: 18, rtl: model.rtl })],
        }),
    ),
    ...Array.from(
      { length: 4 },
      () =>
        new Paragraph({
          spacing: { before: 80, after: 40 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '9BB8D3', space: 1 } },
          children: [new TextRun('')],
        }),
    ),
  ]

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: 16838,
              height: 11906,
            },
            margin: { top: 500, right: 500, bottom: 420, left: 500 },
          },
        },
        children: [
          para([run(model.title, { bold: true, size: 40, color: BLUE, rtl: model.rtl })], align, { after: 60 }),
          ...(model.schoolName
            ? [para([run(model.schoolName, { size: 18, color: MUTED, rtl: model.rtl })], align, { after: 40 })]
            : []),
          ...(model.groupName
            ? [para([run(model.groupName, { bold: true, size: 22, rtl: model.rtl })], align, { after: 160 })]
            : []),
          new Table({
            width: { size: pageWidth, type: WidthType.DXA },
            columnWidths: [dayWidth, ...columns.map(() => slotWidth)],
            layout: TableLayoutType.FIXED,
            visuallyRightToLeft: model.rtl,
            borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
            rows: [header, ...body],
          }),
          ...noteParas,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, `${filename}.docx`)
}

export async function downloadPrintableTimetable(
  model: PrintableTimetable,
  format: 'pdf' | 'word',
  filename: string,
) {
  if (format === 'pdf') await downloadPdf(model, filename)
  else await downloadDocx(model, filename)
}

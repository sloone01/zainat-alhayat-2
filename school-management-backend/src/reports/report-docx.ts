import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture';

/** Product template for due/late payments. Super admin may replace the file. */
export const DUE_INSTALLMENTS_TEMPLATE_ID = '11111111-1111-4111-8111-111111111111';

const LOGO_MARKER = '@@SCHOOL_LOGO@@';
const LOGO_RID = 'rIdSchoolLogo';

export type ReportDocxData = {
  schoolName: string;
  title: string;
  subtitle: string;
  date: string;
  rtl: boolean;
  labelStudent: string;
  labelInstallment: string;
  labelDueDate: string;
  labelBalance: string;
  labelStatus: string;
  labelAmountDue: string;
  labelAmountPaid: string;
  labelDaysOverdue: string;
  rows: Array<{
    student: string;
    installment: string;
    dueDate: string;
    balance: string;
    status: string;
    amountDue: string;
    amountPaid: string;
    daysOverdue: string;
  }>;
};

function p(text: string, opts?: { bold?: boolean; size?: number; center?: boolean }): string {
  const jc = opts?.center ? '<w:jc w:val="center"/>' : '';
  const b = opts?.bold ? '<w:b/>' : '';
  const sz = opts?.size ? `<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>` : '';
  return `<w:p><w:pPr>${jc}<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/></w:pPr><w:r><w:rPr>${b}${sz}<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
}

function cell(inner: string, width: number): string {
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>${inner}</w:tc>`;
}

/** Built-in .docx. Header and first lines both carry the school marks. */
export function defaultDueInstallmentsTemplate(): Buffer {
  const header = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="${W}" xmlns:r="${R}">
  ${p('{{schoolLogo}}')}
  ${p('{{schoolName}}', { bold: true, size: 28 })}
</w:hdr>`;

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}" xmlns:r="${R}" xmlns:wp="${WP}">
  <w:body>
    ${p('{{title}}', { bold: true, size: 28 })}
    ${p('{{subtitle}}')}
    ${p('{{date}}')}
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
      </w:tblBorders></w:tblPr>
      <w:tr>
        ${cell(p('{{labelStudent}}', { bold: true }), 2200)}
        ${cell(p('{{labelInstallment}}', { bold: true }), 1400)}
        ${cell(p('{{labelDueDate}}', { bold: true }), 1400)}
        ${cell(p('{{labelBalance}}', { bold: true }), 1200)}
        ${cell(p('{{labelStatus}}', { bold: true }), 1200)}
        ${cell(p('{{labelAmountDue}}', { bold: true }), 1200)}
        ${cell(p('{{labelAmountPaid}}', { bold: true }), 1200)}
        ${cell(p('{{labelDaysOverdue}}', { bold: true }), 1306)}
      </w:tr>
      <w:tr>
        ${cell(p('{{#rows}}{{student}}'), 2200)}
        ${cell(p('{{installment}}'), 1400)}
        ${cell(p('{{dueDate}}'), 1400)}
        ${cell(p('{{balance}}'), 1200)}
        ${cell(p('{{status}}'), 1200)}
        ${cell(p('{{amountDue}}'), 1200)}
        ${cell(p('{{amountPaid}}'), 1200)}
        ${cell(p('{{daysOverdue}}{{/rows}}'), 1306)}
      </w:tr>
    </w:tbl>
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader"/>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="794" w:right="794" w:bottom="794" w:left="794" w:header="454" w:footer="454" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return packDocx(header, document);
}

/** Built-in course list. Header carries the school marks; one row per course. */
export function defaultCourseListTemplate(): Buffer {
  const header = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="${W}" xmlns:r="${R}">
  ${p('{{schoolLogo}}')}
  ${p('{{schoolName}}', { bold: true, size: 28 })}
</w:hdr>`;

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}" xmlns:r="${R}" xmlns:wp="${WP}">
  <w:body>
    ${p('{{title}}', { bold: true, size: 28 })}
    ${p('{{subtitle}}')}
    ${p('{{date}}')}
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
      </w:tblBorders></w:tblPr>
      <w:tr>
        ${cell(p('{{labelTitle}}', { bold: true }), 2800)}
        ${cell(p('{{labelCategory}}', { bold: true }), 1800)}
        ${cell(p('{{labelStatus}}', { bold: true }), 1600)}
        ${cell(p('{{labelPhases}}', { bold: true }), 1400)}
        ${cell(p('{{labelMilestones}}', { bold: true }), 1400)}
      </w:tr>
      <w:tr>
        ${cell(p('{{#rows}}{{title}}'), 2800)}
        ${cell(p('{{category}}'), 1800)}
        ${cell(p('{{status}}'), 1600)}
        ${cell(p('{{phases}}'), 1400)}
        ${cell(p('{{milestones}}{{/rows}}'), 1400)}
      </w:tr>
    </w:tbl>
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rIdHeader"/>
      <w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>
      <w:pgMar w:top="794" w:right="794" w:bottom="794" w:left="794" w:header="454" w:footer="454" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return packDocx(header, document);
}

function packDocx(header: string, document: string): Buffer {
  const zip = new PizZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdHeader" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
</Relationships>`);
  zip.file('word/_rels/header1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);
  zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr>
  <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
</w:rPr></w:rPrDefault></w:docDefaults></w:styles>`);
  zip.file('word/document.xml', document);
  zip.file('word/header1.xml', header);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
}

/** Flatten Word XML so a tag split across runs still counts. */
export function docxIncludesSchoolMarks(template: Buffer): { schoolName: boolean; schoolLogo: boolean } {
  const zip = new PizZip(template);
  const parts = zip.file(/word\/(document|header\d+|footer\d+)\.xml/) || [];
  const flat = parts.map((file) => file.asText().replace(/<[^>]+>/g, '')).join('\n');
  return {
    schoolName: flat.includes('{{schoolName}}'),
    schoolLogo: flat.includes('{{schoolLogo}}') || flat.includes('{{%schoolLogo}}'),
  };
}

function renderXml(xml: string, data: Record<string, unknown>): string {
  const zip = new PizZip();
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.file('word/document.xml', xml);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '',
  });
  doc.render(data);
  return doc.getZip().file('word/document.xml')?.asText() || xml;
}

function drawingXml(): string {
  const cx = 1524000;
  const cy = 457200;
  return `<w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="${WP}">
      <wp:extent cx="${cx}" cy="${cy}"/>
      <wp:docPr id="1" name="School logo"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${A}" noChangeAspect="1"/></wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="${A}">
        <a:graphicData uri="${PIC}">
          <pic:pic xmlns:pic="${PIC}">
            <pic:nvPicPr><pic:cNvPr id="0" name="logo"/><pic:cNvPicPr/></pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="${LOGO_RID}" xmlns:r="${R}"/>
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>`;
}

function swapLogoMarker(xml: string, logo: Buffer | null): string {
  const pattern = /<w:r\b[^>]*>(?:(?!<\/w:r>)[\s\S])*@@SCHOOL_LOGO@@(?:(?!<\/w:r>)[\s\S])*<\/w:r>/;
  if (!xml.includes(LOGO_MARKER)) return xml;
  if (!logo) return xml.replace(pattern, '').split(LOGO_MARKER).join('');
  return xml.replace(pattern, `<w:r>${drawingXml()}</w:r>`).split(LOGO_MARKER).join('');
}

function ensureImageRel(zip: PizZip, relPath: string): void {
  const current = zip.file(relPath)?.asText() ||
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
  if (current.includes(`Id="${LOGO_RID}"`)) return;
  const next = current.replace(
    '</Relationships>',
    `<Relationship Id="${LOGO_RID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/school-logo.png"/></Relationships>`,
  );
  zip.file(relPath, next);
}

function applyRtl(xml: string): string {
  if (xml.includes('<w:bidi/>') || xml.includes('<w:bidi ')) return xml;
  if (!xml.includes('<w:sectPr')) return xml;
  return xml.replace('<w:sectPr>', '<w:sectPr><w:bidi/>');
}

/**
 * Fill a report template. `{{schoolName}}` and `{{schoolLogo}}` are required in the file.
 * The logo image is embedded; an empty logo leaves the name and a blank logo spot.
 */
export function renderReportDocx(
  template: Buffer,
  data: { rtl: boolean } & Record<string, unknown>,
  logo: Buffer | null,
): Buffer {
  const marks = docxIncludesSchoolMarks(template);
  if (!marks.schoolName || !marks.schoolLogo) {
    throw new Error('Report template must include {{schoolName}} and {{schoolLogo}}');
  }
  const zip = new PizZip(template);
  const payload: Record<string, unknown> = {
    ...data,
    schoolLogo: logo ? LOGO_MARKER : '',
  };
  const names = ['word/document.xml', ...((zip.file(/word\/header\d+\.xml/) || []).map((file) => file.name))];
  for (const name of names) {
    const file = zip.file(name);
    if (!file) continue;
    let xml = file.asText();
    if (xml.includes('{{')) xml = renderXml(xml, payload);
    const hadLogo = xml.includes(LOGO_MARKER);
    xml = swapLogoMarker(xml, logo);
    if (data.rtl && name.endsWith('document.xml')) xml = applyRtl(xml);
    zip.file(name, xml);
    if (hadLogo && logo) {
      const rel = name
        .replace('word/', 'word/_rels/')
        .replace(/\.xml$/, '.xml.rels');
      ensureImageRel(zip, rel);
    }
  }
  if (logo) zip.file('word/media/school-logo.png', logo);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }) as Buffer;
}

import crypto from 'crypto';
import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

/** Prefix used so the embedded identifier is easy to search for in a recovered file. */
export const PDF_TOKEN_PREFIX = 'mh:';

export interface TaggedPdf {
  bytes: Uint8Array;
  token: string;
}

/** Generate a unique, opaque download token (no PII). */
export const generatePdfToken = (): string =>
  `dl_${crypto.randomBytes(12).toString('hex')}`;

/**
 * Build a minimal XMP metadata packet carrying the token. Embedding the token
 * in XMP (in addition to the Info dictionary) increases the chance that at
 * least one copy survives tools that only clear one location.
 */
const buildXmp = (taggedToken: string): string => `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <dc:identifier>${taggedToken}</dc:identifier>
      <xmp:Identifier>${taggedToken}</xmp:Identifier>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

/**
 * Embed an invisible, traceable token into a PDF in several redundant places:
 *  - Info dictionary: Subject, Keywords, Producer, Creator
 *  - Custom Info dictionary key (/MHToken)
 *  - XMP metadata packet
 *
 * The visual appearance of the document is unchanged. Returns the new bytes and
 * the token (which should be persisted to PdfDownloadLog for later lookup).
 *
 * If anything goes wrong, the caller should fall back to serving the original.
 */
export const tagPdfWithToken = async (
  input: ArrayBuffer | Uint8Array,
  token: string = generatePdfToken()
): Promise<TaggedPdf> => {
  const taggedToken = `${PDF_TOKEN_PREFIX}${token}`;

  const pdf = await PDFDocument.load(input, { updateMetadata: false });

  // Standard Info-dictionary fields (read by pdfinfo, exiftool, most viewers).
  // We avoid Title/Author so the document keeps its original visible identity.
  pdf.setSubject(taggedToken);
  pdf.setKeywords([taggedToken]);
  pdf.setProducer(`MedHome LMS (${taggedToken})`);
  pdf.setCreator('MedHome LMS');

  // Custom Info-dictionary key for an extra, less-obvious copy.
  try {
    const infoRef = pdf.context.trailerInfo.Info;
    const infoDict = infoRef ? pdf.context.lookup(infoRef) : undefined;
    if (infoDict && 'set' in (infoDict as object)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (infoDict as any).set(PDFName.of('MHToken'), PDFString.of(taggedToken));
    }
  } catch {
    // Non-fatal: the standard fields above still carry the token.
  }

  // XMP metadata packet (survives some tools that only clear the Info dict).
  try {
    const xmp = buildXmp(taggedToken);
    const metadataStream = pdf.context.stream(xmp, {
      Type: 'Metadata',
      Subtype: 'XML'
    });
    const metadataRef = pdf.context.register(metadataStream);
    pdf.catalog.set(PDFName.of('Metadata'), metadataRef);
  } catch {
    // Non-fatal.
  }

  const bytes = await pdf.save({ useObjectStreams: false });
  return { bytes, token };
};

export type ZipEntry = {
  name: string;
  blob: Blob;
};

function uint16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function uint32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function createZip(files: ZipEntry[]) {
  const encoder = new TextEncoder();
  const localFiles: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;
  const date = new Date();
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data);
    const size = data.length;
    const localHeader = new Uint8Array([
      ...uint32(0x04034b50), ...uint16(20), ...uint16(0x800), ...uint16(0),
      ...uint16(dosTime), ...uint16(dosDate), ...uint32(checksum),
      ...uint32(size), ...uint32(size), ...uint16(name.length), ...uint16(0),
    ]);
    localFiles.push(localHeader, name, data);
    const centralHeader = new Uint8Array([
      ...uint32(0x02014b50), ...uint16(20), ...uint16(20), ...uint16(0x800),
      ...uint16(0), ...uint16(dosTime), ...uint16(dosDate), ...uint32(checksum),
      ...uint32(size), ...uint32(size), ...uint16(name.length), ...uint16(0),
      ...uint16(0), ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(offset),
    ]);
    centralDirectory.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralSize = centralDirectory.reduce((size, part) => size + part.length, 0);
  const end = new Uint8Array([
    ...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(files.length),
    ...uint16(files.length), ...uint32(centralSize), ...uint32(offset), ...uint16(0),
  ]);
  const parts = [...localFiles, ...centralDirectory, end];
  const archive = new Uint8Array(
    parts.reduce((size, part) => size + part.length, 0),
  );
  let position = 0;
  for (const part of parts) {
    archive.set(part, position);
    position += part.length;
  }
  return new Blob([archive.buffer], {
    type: "application/zip",
  });
}

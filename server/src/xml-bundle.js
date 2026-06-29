import path from 'node:path';
import JSZip from 'jszip';
import XLSX from 'xlsx';

const MIME_EXTENSION_MAP = {
  'application/xml': '.xml',
  'text/xml': '.xml',
  'application/pdf': '.pdf',
  'application/json': '.json',
  'text/plain': '.txt',
  'application/octet-stream': '.bin',
};

const sanitizeFileName = (value) => {
  return String(value)
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 120);
};

const detectExtension = (urlValue, contentType) => {
  const parsedUrl = new URL(urlValue);
  const extFromPath = path.extname(parsedUrl.pathname);

  if (extFromPath) {
    return extFromPath;
  }

  const normalizedContentType = String(contentType || '').split(';')[0].trim().toLowerCase();
  return MIME_EXTENSION_MAP[normalizedContentType] || '.xml';
};

const buildFileName = (urlValue, index, contentType) => {
  const parsedUrl = new URL(urlValue);
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
  const rawBaseName = pathSegments[pathSegments.length - 1] || `arquivo_${index + 1}`;
  const safeBaseName = sanitizeFileName(rawBaseName.replace(path.extname(rawBaseName), '')) || `arquivo_${index + 1}`;
  const extension = detectExtension(urlValue, contentType);

  return `${String(index + 1).padStart(5, '0')}_${safeBaseName}${extension}`;
};

const downloadSingleLink = async (urlValue, index) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(urlValue, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        url: urlValue,
        error: `Status: ${response.status}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const fileName = buildFileName(urlValue, index, contentType);
    const arrayBuffer = await response.arrayBuffer();

    return {
      success: true,
      url: urlValue,
      fileName,
      buffer: Buffer.from(arrayBuffer),
      contentType,
      size: arrayBuffer.byteLength,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao baixar URL.';

    return {
      success: false,
      url: urlValue,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const runWithConcurrency = async (items, limit, handler) => {
  const results = [];
  let currentIndex = 0;

  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (currentIndex < items.length) {
      const myIndex = currentIndex;
      currentIndex += 1;
      results[myIndex] = await handler(items[myIndex], myIndex);
    }
  });

  await Promise.all(workers);
  return results;
};

export const generateXmlBundleZip = async ({ resultados, links }) => {
  const zip = new JSZip();

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(resultados, {
    header: ['resultado'],
  });
  XLSX.utils.book_append_sheet(workbook, worksheet, 'resultado');

  const xlsxBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  zip.file('links_xml.xlsx', xlsxBuffer);
  zip.file('links.txt', `${links.join('\n')}\n`);

  const xmlFolder = zip.folder('xml');
  const downloadResults = await runWithConcurrency(links, 8, downloadSingleLink);

  const successful = downloadResults.filter((item) => item?.success);
  const failed = downloadResults.filter((item) => !item?.success);

  successful.forEach((item) => {
    xmlFolder.file(item.fileName, item.buffer);
  });

  zip.file(
    'relatorio_download.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalLinks: links.length,
        successful: successful.length,
        failed: failed.length,
        failedItems: failed.map((item) => ({ url: item.url, error: item.error })),
      },
      null,
      2,
    ),
  );

  zip.file('failed_urls.txt', `${failed.map((item) => item.url).join('\n')}\n`);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    zipBuffer,
    stats: {
      totalLinks: links.length,
      successful: successful.length,
      failed: failed.length,
    },
  };
};

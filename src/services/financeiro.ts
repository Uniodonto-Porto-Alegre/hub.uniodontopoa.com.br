export const FINANCEIRO_FATURAS_XLSX_URL =
  import.meta.env.VITE_FINANCEIRO_FATURAS_XLSX_URL?.trim() || '/api/financeiro/faturas-links-xlsx';
export const FINANCEIRO_FATURAS_LINKS_JSON_URL =
  import.meta.env.VITE_FINANCEIRO_FATURAS_LINKS_JSON_URL?.trim() || '/api/financeiro/faturas-links-json';
export const FINANCEIRO_FATURAS_XML_ZIP_URL =
  import.meta.env.VITE_FINANCEIRO_FATURAS_XML_ZIP_URL?.trim() || '/api/financeiro/faturas-xml-zip';

const buildAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {};

  if (!token?.trim()) {
    return headers;
  }

  headers.Authorization = `Bearer ${token.trim()}`;
  return headers;
};

export const gerarXlsxLinksXmlPorFatura = async ({
  arquivo,
  token,
}: {
  arquivo: File;
  token?: string;
}) => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const response = await fetch(FINANCEIRO_FATURAS_XLSX_URL, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    let message = 'Não foi possível gerar a planilha de links XML.';

    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Mantém mensagem padrão quando não houver JSON de erro.
    }

    throw new Error(message);
  }

  return response.blob();
};

export const obterLinksXmlPorFatura = async ({
  arquivo,
  token,
}: {
  arquivo: File;
  token?: string;
}) => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const response = await fetch(FINANCEIRO_FATURAS_LINKS_JSON_URL, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    let message = 'Não foi possível obter os links XML.';

    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Mantém mensagem padrão quando não houver JSON de erro.
    }

    throw new Error(message);
  }

  return (await response.json()) as {
    totalFaturas: number;
    totalLinks: number;
    links: string[];
  };
};

export const gerarPacoteXmlPorFatura = async ({
  arquivo,
  token,
}: {
  arquivo: File;
  token?: string;
}) => {
  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const response = await fetch(FINANCEIRO_FATURAS_XML_ZIP_URL, {
    method: 'POST',
    headers: buildAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    let message = 'Não foi possível gerar o pacote ZIP de XMLs.';

    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // Mantém mensagem padrão quando não houver JSON de erro.
    }

    throw new Error(message);
  }

  return {
    blob: await response.blob(),
    stats: {
      totalLinks: Number(response.headers.get('X-Total-Links') || '0'),
      successful: Number(response.headers.get('X-Successful-Downloads') || '0'),
      failed: Number(response.headers.get('X-Failed-Downloads') || '0'),
    },
  };
};

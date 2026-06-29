<template>
  <div class="card shadow-sm border-0 mt-4">
    <div class="card-header bg-uniodonto-vinho py-3">
      <h5 class="mb-0 fw-bold d-flex align-items-center">
        <i class="bi bi-file-earmark-spreadsheet me-2"></i>
        Exportar links XML por Fatura
      </h5>
    </div>

    <div class="card-body p-4">
      <p class="text-muted mb-4">
        Envie um arquivo .xls/.xlsx com a coluna <strong>fatura</strong>. O sistema executa a consulta na tabela
        <code>nfse_geracao</code> e gera um arquivo <strong>.zip</strong> com os XMLs das notas, o
        <code>links_xml.xlsx</code> e relatórios de falha.
      </p>

      <div
        class="upload-area mb-3 p-4 border-2 border-dashed rounded text-center cursor-pointer"
        :class="{ 'is-active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="abrirSeletorArquivo"
      >
        <input
          ref="fileInput"
          type="file"
          class="d-none"
          accept=".xls,.xlsx"
          @change="onFileChange"
        />

        <i class="bi bi-cloud-arrow-up fs-2 text-uniodonto-vinho"></i>
        <h6 class="fw-bold mt-2 mb-1">Arraste a planilha ou clique para selecionar</h6>
        <p class="text-muted small mb-0">Formatos aceitos: .xls e .xlsx</p>
      </div>

      <div v-if="arquivoSelecionado" class="alert alert-light border d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">Arquivo selecionado</div>
          <small class="text-muted">{{ arquivoSelecionado.name }}</small>
        </div>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="limparArquivo"
          :disabled="isLoadingXlsx"
        >
          Remover
        </button>
      </div>

      <div v-if="mensagemErro" class="alert alert-danger" role="alert">
        {{ mensagemErro }}
      </div>

      <div v-if="mensagemSucesso" class="alert alert-success" role="alert">
        {{ mensagemSucesso }}
      </div>

      <div class="d-flex gap-2">
        <button
          class="btn btn-uniodonto"
          type="button"
          :disabled="!arquivoSelecionado || isLoadingXlsx"
          @click="executarConsulta"
        >
          <span v-if="isLoadingXlsx" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoadingXlsx ? 'Processando...' : 'Executar consulta e gerar XML (ZIP)' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { gerarPacoteXmlPorFatura } from '../../../services/financeiro';

const authStore = useAuthStore();

const fileInput = ref<HTMLInputElement | null>(null);
const arquivoSelecionado = ref<File | null>(null);
const mensagemErro = ref('');
const mensagemSucesso = ref('');
const isDragging = ref(false);
const isLoadingXlsx = ref(false);

const validarArquivo = (file: File) => {
  const nome = file.name.toLowerCase();
  return nome.endsWith('.xls') || nome.endsWith('.xlsx');
};

const selecionarArquivo = (file: File) => {
  mensagemErro.value = '';
  mensagemSucesso.value = '';

  if (!validarArquivo(file)) {
    mensagemErro.value = 'Selecione um arquivo Excel válido (.xls ou .xlsx).';
    arquivoSelecionado.value = null;
    return;
  }

  arquivoSelecionado.value = file;
};

const abrirSeletorArquivo = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  selecionarArquivo(input.files[0]!);
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;

  if (!event.dataTransfer?.files.length) {
    return;
  }

  selecionarArquivo(event.dataTransfer.files[0]!);
};

const limparArquivo = () => {
  arquivoSelecionado.value = null;
  mensagemErro.value = '';
  mensagemSucesso.value = '';

  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const baixarBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const executarConsulta = async () => {
  if (!arquivoSelecionado.value) {
    return;
  }

  isLoadingXlsx.value = true;
  mensagemErro.value = '';
  mensagemSucesso.value = '';

  try {
    const data = await gerarPacoteXmlPorFatura({
      arquivo: arquivoSelecionado.value,
      token: authStore.token,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    baixarBlob(data.blob, `xml_notas_${timestamp}.zip`);
    mensagemSucesso.value = `Pacote ZIP gerado com sucesso. Links: ${data.stats.totalLinks}, baixados: ${data.stats.successful}, falhas: ${data.stats.failed}.`;
  } catch (error) {
    mensagemErro.value = error instanceof Error ? error.message : 'Falha ao gerar pacote ZIP.';
  } finally {
    isLoadingXlsx.value = false;
  }
};
</script>

<style scoped lang="scss">
.upload-area {
  transition: all 0.25s ease;
  background-color: #f8f9fa;

  &.is-active {
    background-color: #e9ecef;
    border-color: var(--bs-primary) !important;
  }

  &:hover {
    background-color: #f1f3f5;
    border-color: #dee2e6;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>

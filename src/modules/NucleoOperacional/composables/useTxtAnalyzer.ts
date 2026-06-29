import { ref, computed } from 'vue';
import tabelaTissData from '../../../assets/data/tabela_tiss.json';

export interface ProcedimentoEncontrado {
    linha: number;
    codigo: string;
    descricao: string;
    valido: boolean;
}

export function useTxtAnalyzer() {
    const totalLinhas = ref(0);
    const procedimentos = ref<ProcedimentoEncontrado[]>([]);
    const estaProcessando = ref(false);

    const estatisticas = computed(() => {
        const total = procedimentos.value.length;
        const validos = procedimentos.value.filter(p => p.valido).length;
        const invalidos = total - validos;
        return { total, validos, invalidos };
    });

    const analisarTexto = (texto: string) => {
        estaProcessando.value = true;
        const linhas = texto.split(/\r?\n/);
        totalLinhas.value = linhas.length;
        procedimentos.value = [];

        // Regex para capturar códigos de 8 dígitos
        const regexCodigo = /\b\d{8}\b/g;

        linhas.forEach((linhaTexto, index) => {
            if (linhaTexto.trim().length < 5) return;

            const matches = linhaTexto.match(regexCodigo);

            if (matches) {
                matches.forEach(codigo => {
                    const itemTabela = (tabelaTissData as any[]).find(t => t.codigo === codigo && t.ativo !== false);

                    procedimentos.value.push({
                        linha: index + 1,
                        codigo: codigo,
                        descricao: itemTabela ? itemTabela.descricao : 'Descrição não encontrada',
                        valido: !!itemTabela
                    });
                });
            }
        });
        estaProcessando.value = false;
    };

    const processarArquivo = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const texto = e.target?.result as string;
            analisarTexto(texto);
        };
        // ISO-8859-1 para suportar acentos de arquivos legados
        reader.readAsText(file, 'ISO-8859-1');
    };

    const limpar = () => {
        totalLinhas.value = 0;
        procedimentos.value = [];
    };

    return {
        totalLinhas,
        procedimentos,
        estatisticas,
        estaProcessando,
        processarArquivo,
        limpar
    };
}

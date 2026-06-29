-- ============================================================
-- Hub Uniodonto Porto Alegre
-- Script: Carga inicial de procedimentos TISS a partir do JSON
--
-- Uso: execute APÓS o script 01_criar_tabela_tiss.sql
-- Estratégia: MERGE (upsert) — seguro para rodar múltiplas vezes
-- Banco:  SQL Server 2014
-- Data:   2026-03-26
-- ============================================================

USE [HubUniodonto];   -- Altere para o nome do seu banco de dados
GO

-- Tabela temporária com os dados do JSON
CREATE TABLE #ImportacaoTISS (
    Codigo         VARCHAR(8)    NOT NULL,
    Descricao      NVARCHAR(255) NOT NULL,
    Ativo          BIT           NOT NULL,
    VigenciaInicio DATE          NOT NULL,
    VigenciaFim    DATE              NULL,
    AtualizadoEm   DATE          NOT NULL
);

-- ------------------------------------------------------------
-- Inserção dos registros exportados do tabela_tiss.json
-- Para adicionar novos procedimentos, inclua mais linhas aqui
-- no mesmo padrão e execute novamente — o MERGE cuida do resto
-- ------------------------------------------------------------
INSERT INTO #ImportacaoTISS VALUES ('81000014', N'Consulta Urgência',                               1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000030', N'Consulta odontológica',                           1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000049', N'Consulta odontológica de retorno',                1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000057', N'Consulta odontológica de urgência noturna',       1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000065', N'Consulta odontológica inicial',                   1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000073', N'Consulta odontológica especializada',             1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('81000340', N'Radiografia da ATM',                              1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('82000468', N'Procedimento de diagnóstico laboratorial',        1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('83000097', N'Mantenedor de Espaço Fixo',                       1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('83000100', N'Mantenedor de Espaço Removível',                  1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('84000198', N'Exodontia Simples',                               1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('85100072', N'Placa de Acetato para Clareamento',               1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('85100200', N'Restauração de dente',                            1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('85200018', N'Clareamento de Dente Desvitalizado',              1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('85300047', N'Procedimento Periodontia',                        1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('86000300', N'Reposição de Aparelho Móvel',                     1, '2025-07-01', NULL, '2026-03-26');
INSERT INTO #ImportacaoTISS VALUES ('87000148', N'Procedimento odontológico hospitalar',            1, '2025-07-01', NULL, '2026-03-26');

-- ------------------------------------------------------------
-- MERGE: insere novos, atualiza existentes (pelo código)
-- Jamais exclui registros automaticamente por segurança
-- ------------------------------------------------------------
MERGE [dbo].[ProcedimentosTISS] AS destino
USING #ImportacaoTISS AS origem
    ON destino.Codigo = origem.Codigo

WHEN MATCHED THEN
    UPDATE SET
        destino.Descricao      = origem.Descricao,
        destino.Ativo          = origem.Ativo,
        destino.VigenciaInicio = origem.VigenciaInicio,
        destino.VigenciaFim    = origem.VigenciaFim,
        destino.AtualizadoEm   = origem.AtualizadoEm

WHEN NOT MATCHED BY TARGET THEN
    INSERT (Codigo, Descricao, Ativo, VigenciaInicio, VigenciaFim, AtualizadoEm)
    VALUES (origem.Codigo, origem.Descricao, origem.Ativo, origem.VigenciaInicio, origem.VigenciaFim, origem.AtualizadoEm);

-- Limpeza
DROP TABLE #ImportacaoTISS;

-- Relatório da carga
SELECT
    COUNT(*)                                        AS TotalRegistros,
    SUM(CASE WHEN Ativo = 1 THEN 1 ELSE 0 END)     AS Ativos,
    SUM(CASE WHEN Ativo = 0 THEN 1 ELSE 0 END)     AS Inativados
FROM [dbo].[ProcedimentosTISS];

PRINT 'Carga de procedimentos TISS concluída.';
GO

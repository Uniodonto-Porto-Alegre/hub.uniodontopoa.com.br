-- ============================================================
-- Hub Uniodonto Porto Alegre
-- Script: Criação da tabela de procedimentos TISS
-- Banco:  SQL Server 2014 (compatível com versões superiores)
-- Data:   2026-03-26
-- ============================================================

USE [HubUniodonto];   -- Altere para o nome do seu banco de dados
GO

-- ------------------------------------------------------------
-- Tabela principal de procedimentos TISS
-- ------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'ProcedimentosTISS' AND type = 'U'
)
BEGIN
    CREATE TABLE [dbo].[ProcedimentosTISS] (
        [Id]             INT           IDENTITY(1,1)   NOT NULL,
        [Codigo]         VARCHAR(8)                    NOT NULL,   -- Código TISS (8 dígitos)
        [Descricao]      NVARCHAR(255)                 NOT NULL,
        [Ativo]          BIT                           NOT NULL    CONSTRAINT [DF_ProcedimentosTISS_Ativo] DEFAULT (1),
        [VigenciaInicio] DATE                          NOT NULL,
        [VigenciaFim]    DATE                              NULL,   -- NULL = sem previsão de encerramento
        [AtualizadoEm]   DATE                          NOT NULL    CONSTRAINT [DF_ProcedimentosTISS_AtualizadoEm] DEFAULT (GETDATE()),

        CONSTRAINT [PK_ProcedimentosTISS] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    -- Índice único no código para evitar duplicatas e acelerar buscas
    CREATE UNIQUE NONCLUSTERED INDEX [UX_ProcedimentosTISS_Codigo]
        ON [dbo].[ProcedimentosTISS] ([Codigo] ASC);

    -- Índice de suporte para filtros por vigência e status
    CREATE NONCLUSTERED INDEX [IX_ProcedimentosTISS_Ativo_Vigencia]
        ON [dbo].[ProcedimentosTISS] ([Ativo] ASC, [VigenciaInicio] ASC, [VigenciaFim] ASC);

    PRINT 'Tabela ProcedimentosTISS criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela ProcedimentosTISS já existe — nenhuma alteração feita.';
END
GO

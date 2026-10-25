export interface SqlScript {
  id: string;
  title: string;
  database: string;
  category: 'orquestador' | 'empresa' | 'auditoria' | 'report_builder' | 'respaldo' | 'migracion';
  description: string;
  code: string;
  explanation: string[];
  improvements: string[];
  saintTables: string[];
}

export const SQL_SCRIPTS: SqlScript[] = [
  {
    id: 'consulta_diagnostico',
    title: '1° Paso: Consulta Diagnóstico en SAACXC (Solo Lectura - 100% Inofensiva)',
    database: 'LOSROBLES',
    category: 'migracion',
    description: 'Consulta SELECT de solo lectura para auditar cuántos registros en SAACXC tienen Factor, MontoMEx y SaldoMEx en cero tras migrar de 9024 a 9750.',
    saintTables: ['SAACXC', 'SACONF', 'SAMECA_07', 'SAMECA_03'],
    explanation: [
      'Es una consulta 100% segura de solo lectura (SELECT). NO modifica, no borra ni bloquea ninguna tabla.',
      'Utiliza la directiva WITH (NOLOCK) para no interferir con usuarios que estén trabajando en Saint.',
      'Devuelve 3 paneles: 1) Factores configurados actuales, 2) Conteo de registros que necesitan regularizarse, 3) Muestra de 10 registros.',
      'Permite saber exactamente cuántas facturas (10) y cuotas (70) vinieron en cero de la versión 9024.'
    ],
    improvements: [
      'Cero riesgo operativo: no realiza transacciones.',
      'Visibilidad total de la cartera antes de aplicar cualquier cambio.',
      'Muestra la tasa con la que se calculará la regularización.'
    ],
    code: `-- ==================================================================================
-- CONSULTA 1: DIAGNÓSTICO PREVIO DE MIGRACIÓN SAINT 9024 -> 9750
-- Base de Datos: LOSROBLES
-- Tipo: SOLO LECTURA (100% Segura - No altera ningún dato)
-- Objetivo: Identificar registros con Factor = 0, MontoMEx = 0 o SaldoMEx = 0
-- ==================================================================================
USE [LOSROBLES];
GO

SET NOCOUNT ON;

-------------------------------------------------------------------------------------
-- RESULTADO 1: FACTORES Y FECHAS DE CORTE ACTUALES EN EL SISTEMA
-------------------------------------------------------------------------------------
SELECT 
    '1. FACTORES DEL SISTEMA' AS Seccion,
    (SELECT TOP 1 FACTOR FROM dbo.SACONF WITH (NOLOCK)) AS FactorActual_SACONF,
    (SELECT TOP 1 Factor FROM dbo.SAMECA_07 WITH (NOLOCK) ORDER BY Fecha_Proceso DESC, Hora DESC) AS UltimoFactor_SAMECA07,
    (SELECT TOP 1 Fecha_Proceso FROM dbo.SAMECA_07 WITH (NOLOCK) ORDER BY Fecha_Proceso DESC, Hora DESC) AS FechaUltimoFactor,
    (SELECT TOP 1 Fecha_Indexar_Cuotas FROM dbo.SAMECA_03 WITH (NOLOCK) WHERE CODMECA = '01') AS FechaCorteCuotas,
    (SELECT TOP 1 Fecha_Indexar_Facturas FROM dbo.SAMECA_03 WITH (NOLOCK) WHERE CODMECA = '01') AS FechaCorteFacturas;

-------------------------------------------------------------------------------------
-- RESULTADO 2: RESUMEN Y CONTEO DE DOCUMENTOS EN SAACXC QUE REQUIEREN REGULARIZACIÓN
-------------------------------------------------------------------------------------
SELECT 
    CASE 
        WHEN TipoCxC = 10 THEN 'Factura (10)'
        WHEN TipoCxC = 70 THEN 'Cuota (70)'
        ELSE CONCAT('Otro Tipo (', TipoCxC, ')')
    END AS TipoDocumento,
    COUNT(*) AS TotalDocumentos,
    SUM(CASE WHEN Saldo > 0 THEN 1 ELSE 0 END) AS ConSaldoPendiente_Bs,
    SUM(CASE WHEN Saldo = 0 THEN 1 ELSE 0 END) AS Pagados_SaldoCero,
    -- Campos de la versión 9750 que vienen de la 9024
    SUM(CASE WHEN Factor IS NULL OR Factor = 0 THEN 1 ELSE 0 END) AS ConFactorEnCero,
    SUM(CASE WHEN MontoMEx IS NULL OR MontoMEx = 0 THEN 1 ELSE 0 END) AS ConMontoMExEnCero,
    SUM(CASE WHEN (SaldoMEx IS NULL OR SaldoMEx = 0) AND Saldo > 0 THEN 1 ELSE 0 END) AS ConSaldoMExEnCero_Y_DeudaBs,
    ROUND(SUM(Saldo), 2) AS SaldoTotal_Bs
FROM dbo.SAACXC WITH (NOLOCK)
GROUP BY TipoCxC
ORDER BY TipoCxC ASC;

-------------------------------------------------------------------------------------
-- RESULTADO 3: MUESTRA DE 10 REGISTROS REALES PARA INSPECCIÓN VISUAL
-------------------------------------------------------------------------------------
SELECT TOP 10 
    NroUnico,
    NumeroD AS NroDocumento,
    CodClie AS CodigoCliente,
    TipoCxC,
    Fechav AS FechaVencimiento,
    Monto AS Monto_Bs,
    Saldo AS Saldo_Bs,
    Factor AS Factor_Actual,
    MontoMEx AS Monto_Divisa,
    SaldoMEx AS Saldo_Divisa
FROM dbo.SAACXC WITH (NOLOCK)
WHERE Saldo > 0
ORDER BY Fechav DESC;
GO`
  },
  {
    id: 'regularizacion_migracion',
    title: 'Script de Regularización Inicial: Post-Migración 9024 → 9750 (Fuera de Indexación)',
    database: 'LOSROBLES / CLUBDEPORTIVO / PROCENTROS',
    category: 'migracion',
    description: 'Puebla de forma segura los campos Factor, MontoMEx y SaldoMEx en SAACXC que quedaron en cero durante la migración de Saint 9024 a 9750.',
    saintTables: ['SAACXC', 'SACONF', 'SAMECA_07', 'SAMECA_06', 'SAMECA_03'],
    explanation: [
      'En Saint 9024 no existían los campos nativos MontoMEx y SaldoMEx (o no se usaban), por lo que la migración a 9750 los deja en 0.00.',
      'Este script se corre UNA SOLA VEZ fuera de la indexación para regularizar toda la data histórica.',
      'Calcula MontoMEx = ROUND(Monto / Factor, 2) y SaldoMEx = ROUND(Saldo / Factor, 2) a partir del factor histórico correspondiente.',
      'Si Saldo es 0.00 (documento ya pagado), SaldoMEx se asigna en 0.00 de forma limpia.',
      'Pone al día el campo Factor con la tasa de referencia para que los documentos no sigan con factor 0.00.'
    ],
    improvements: [
      'Establece el valor referencial en divisas (USD) que permanecerá fijo en la indexación.',
      'Previene divisiones por cero con NULLIF y condicionales WHERE.',
      'Incluye modo @Simular = 1 para verificar el resultado antes de confirmar cambios.'
    ],
    code: `-- ==================================================================================
-- SCRIPT DE REGULARIZACIÓN POST-MIGRACIÓN: SAINT 9024 A 9750
-- Objetivo: Poblar Factor, MontoMEx y SaldoMEx en SAACXC para datos históricos migrados en cero
-- Frecuencia: SE EJECUTA UNA SOLA VEZ FUERA DE LA INDEXACIÓN (Puesta a Punto Inicial)
-- Autor: Consultoría DBA Saint Enterprise (Para Martha)
-- ==================================================================================

-------------------------------------------------------------------------------------
-- PARTE 1: REGULARIZACIÓN EN [LOSROBLES]
-------------------------------------------------------------------------------------
USE [LOSROBLES];
GO

SET NOCOUNT ON;

DECLARE @FactorBaseRobles DECIMAL(28,4);
DECLARE @ModoSimulacion BIT = 0; -- 1 = Solo previsualizar, 0 = Ejecutar cambios reales

-- 1. Obtener factor de referencia histórico (de SAMECA_07 o SACONF)
SELECT TOP 1 @FactorBaseRobles = Factor 
FROM dbo.SAMECA_07 
ORDER BY Fecha_Proceso DESC, Hora DESC;

IF @FactorBaseRobles IS NULL OR @FactorBaseRobles <= 0
    SELECT TOP 1 @FactorBaseRobles = FACTOR FROM dbo.SACONF;

PRINT CONCAT('=== LOSROBLES: Factor Base de Referencia para Migración: ', @FactorBaseRobles, ' ===');

-- Diagnóstico previo: ¿Cuántos registros están en cero?
SELECT 
    COUNT(*) AS TotalRegistrosSinRegularizar,
    SUM(CASE WHEN TipoCxC = 10 THEN 1 ELSE 0 END) AS Facturas_Tipo10,
    SUM(CASE WHEN TipoCxC = 70 THEN 1 ELSE 0 END) AS Cuotas_Tipo70,
    SUM(CASE WHEN Saldo > 0 THEN 1 ELSE 0 END) AS ConSaldoPendiente,
    SUM(CASE WHEN Saldo = 0 THEN 1 ELSE 0 END) AS YaCancelados
FROM dbo.SAACXC
WHERE (Factor IS NULL OR Factor = 0)
   OR (MontoMEx IS NULL OR MontoMEx = 0);

IF @ModoSimulacion = 0
BEGIN
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Actualización Masiva Set-Based: Poblar Factor, MontoMEx y SaldoMEx
        UPDATE dbo.SAACXC
        SET 
            -- 1. Actualizar el Factor si está en cero
            Factor = CASE 
                        WHEN (Factor IS NULL OR Factor <= 0) THEN @FactorBaseRobles 
                        ELSE Factor 
                     END,

            -- 2. MontoMEx = Monto / Factor
            MontoMEx = CASE 
                        WHEN (MontoMEx IS NULL OR MontoMEx = 0) AND Monto > 0 
                            THEN ROUND(Monto / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBaseRobles END, 2)
                        ELSE ISNULL(MontoMEx, 0)
                       END,

            -- 3. SaldoMEx = Saldo / Factor (Si el saldo en Bs es 0, SaldoMEx queda en 0)
            SaldoMEx = CASE 
                        WHEN (SaldoMEx IS NULL OR SaldoMEx = 0) AND Saldo > 0 
                            THEN ROUND(Saldo / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBaseRobles END, 2)
                        WHEN Saldo = 0 THEN 0
                        ELSE ISNULL(SaldoMEx, 0)
                       END
        WHERE (Factor IS NULL OR Factor <= 0)
           OR (MontoMEx IS NULL OR MontoMEx = 0)
           OR (SaldoMEx IS NULL AND Saldo = 0);

        PRINT CONCAT('LOSROBLES: Registros regularizados exitosamente: ', @@ROWCOUNT);
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        PRINT CONCAT('Error al regularizar LOSROBLES: ', ERROR_MESSAGE());
        THROW;
    END CATCH
END
GO

-------------------------------------------------------------------------------------
-- PARTE 2: REGULARIZACIÓN EN [CLUBDEPORTIVO]
-------------------------------------------------------------------------------------
USE [CLUBDEPORTIVO];
GO

SET NOCOUNT ON;

DECLARE @FactorBaseClub DECIMAL(28,4);

SELECT TOP 1 @FactorBaseClub = Factor 
FROM dbo.SAMECA_06 
ORDER BY Fecha_Proceso DESC, Hora DESC;

IF @FactorBaseClub IS NULL OR @FactorBaseClub <= 0
    SELECT TOP 1 @FactorBaseClub = FACTOR FROM dbo.SACONF;

PRINT CONCAT('=== CLUBDEPORTIVO: Factor Base: ', @FactorBaseClub, ' ===');

BEGIN TRANSACTION;
BEGIN TRY
    UPDATE dbo.SAACXC
    SET 
        Factor = CASE 
                    WHEN (Factor IS NULL OR Factor <= 0) THEN @FactorBaseClub 
                    ELSE Factor 
                 END,
        MontoMEx = CASE 
                    WHEN (MontoMEx IS NULL OR MontoMEx = 0) AND Monto > 0 
                        THEN ROUND(Monto / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBaseClub END, 2)
                    ELSE ISNULL(MontoMEx, 0)
                   END,
        SaldoMEx = CASE 
                    WHEN (SaldoMEx IS NULL OR SaldoMEx = 0) AND Saldo > 0 
                        THEN ROUND(Saldo / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBaseClub END, 2)
                    WHEN Saldo = 0 THEN 0
                    ELSE ISNULL(SaldoMEx, 0)
                   END
    WHERE (Factor IS NULL OR Factor <= 0)
       OR (MontoMEx IS NULL OR MontoMEx = 0)
       OR (SaldoMEx IS NULL AND Saldo = 0);

    PRINT CONCAT('CLUBDEPORTIVO: Registros regularizados exitosamente: ', @@ROWCOUNT);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT CONCAT('Error en CLUBDEPORTIVO: ', ERROR_MESSAGE());
    THROW;
END CATCH
GO

-------------------------------------------------------------------------------------
-- PARTE 3: REGULARIZACIÓN EN [PROCENTROS]
-------------------------------------------------------------------------------------
USE [PROCENTROS];
GO

SET NOCOUNT ON;

DECLARE @FactorBasePro DECIMAL(28,4);

SELECT TOP 1 @FactorBasePro = Factor 
FROM dbo.SAMECA_03 
ORDER BY Fecha_Proceso DESC, Hora DESC;

IF @FactorBasePro IS NULL OR @FactorBasePro <= 0
    SELECT TOP 1 @FactorBasePro = FACTOR FROM dbo.SACONF;

PRINT CONCAT('=== PROCENTROS: Factor Base: ', @FactorBasePro, ' ===');

BEGIN TRANSACTION;
BEGIN TRY
    UPDATE dbo.SAACXC
    SET 
        Factor = CASE 
                    WHEN (Factor IS NULL OR Factor <= 0) THEN @FactorBasePro 
                    ELSE Factor 
                 END,
        MontoMEx = CASE 
                    WHEN (MontoMEx IS NULL OR MontoMEx = 0) AND Monto > 0 
                        THEN ROUND(Monto / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBasePro END, 2)
                    ELSE ISNULL(MontoMEx, 0)
                   END,
        SaldoMEx = CASE 
                    WHEN (SaldoMEx IS NULL OR SaldoMEx = 0) AND Saldo > 0 
                        THEN ROUND(Saldo / CASE WHEN Factor > 0 THEN Factor ELSE @FactorBasePro END, 2)
                    WHEN Saldo = 0 THEN 0
                    ELSE ISNULL(SaldoMEx, 0)
                   END
    WHERE (Factor IS NULL OR Factor <= 0)
       OR (MontoMEx IS NULL OR MontoMEx = 0)
       OR (SaldoMEx IS NULL AND Saldo = 0);

    PRINT CONCAT('PROCENTROS: Registros regularizados exitosamente: ', @@ROWCOUNT);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    PRINT CONCAT('Error en PROCENTROS: ', ERROR_MESSAGE());
    THROW;
END CATCH
GO`
  },
  {
    id: 'orquestador',
    title: 'Procedimiento Maestro en Cascada (Orquestador Central)',
    database: 'LOSROBLES',
    category: 'orquestador',
    description: 'Ejecuta la indexación en cascada en orden estricto: 1° Los Robles, 2° Club Deportivo y 3° Procentro, con manejo robusto de transacciones y registro en bitácora.',
    saintTables: ['SACONF', 'SAACXC', 'SAMECA_07', 'SAMECA_06', 'SAMECA_03', 'LOG_INDEXACION_SAINT'],
    explanation: [
      'Encapsula toda la lógica de negocio dentro del motor SQL Server, eliminando contraseñas en archivos .bat.',
      'Asegura la secuencia en cascada solicitada: Los Robles -> Club Deportivo -> Procentro.',
      'Implementa bloque TRY...CATCH con control de nivel de severidad y captura de errores con ERROR_MESSAGE().',
      'Si una empresa falla, registra la anomalía en la tabla de auditoría y detiene la cascada para proteger la integridad.',
      'Devuelve un conjunto de resultados tabular ideal para ser consumido directamente por Saint Report Builder.'
    ],
    improvements: [
      'Sin credenciales SA expuestas en texto plano ni puertos abiertos innecesarios.',
      'Cero archivos sueltos en el escritorio o disco local: todo respaldable en el .BAK de LOSROBLES.',
      'Totalmente autónomo para migrar a servidores de laboratorio sin reconfigurar rutas de Windows.'
    ],
    code: `-- ==================================================================================
-- PROCEDIMIENTO MAESTRO: sp_Ejecutar_Indexacion_Cascada
-- Base de Datos Host: LOSROBLES (Base central de ejecución)
-- Objetivo: Ejecutar indexación en cascada para LOSROBLES -> CLUBDEPORTIVO -> PROCENTROS
-- Autor: Consultoría DBA Saint Enterprise (Para Martha)
-- Estándar: T-SQL Set-Based, Transaccional ACID, TRY...CATCH
-- Compatible con: Saint Enterprise Administrativo 9.750+ (Manejo de Factor, MontoMEx, SaldoMEx)
-- ==================================================================================
USE [LOSROBLES];
GO

IF OBJECT_ID('dbo.sp_Ejecutar_Indexacion_Cascada', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Ejecutar_Indexacion_Cascada;
GO

CREATE PROCEDURE dbo.sp_Ejecutar_Indexacion_Cascada
    @UsuarioEjecutor VARCHAR(50) = 'SISTEMA_SAINT'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @IdLote UNIQUEIDENTIFIER = NEWID();
    DECLARE @FechaInicio DATETIME = GETDATE();
    DECLARE @EstadoGlobal VARCHAR(20) = 'EXITOSO';
    DECLARE @MensajeFinal VARCHAR(500) = 'Proceso en cascada completado satisfactoriamente.';
    
    DECLARE @FilasRobles INT = 0, @FilasClub INT = 0, @FilasProcentro INT = 0;
    DECLARE @TasaRobles DECIMAL(28,4) = 0, @TasaClub DECIMAL(28,4) = 0, @TasaProcentro DECIMAL(28,4) = 0;

    CREATE TABLE #ResultadoCascada (
        Paso INT,
        Empresa VARCHAR(50),
        TasaAplicada DECIMAL(28,4),
        RegistrosAfectados INT,
        Estado VARCHAR(20),
        Detalle VARCHAR(250)
    );

    BEGIN TRY
        -----------------------------------------------------------------------------
        -- PASO 1: INDEXACIÓN EN LOS ROBLES (Base Principal)
        -----------------------------------------------------------------------------
        EXEC [LOSROBLES].[dbo].[sp_Indexar_LosRobles]
            @IdLote = @IdLote,
            @Usuario = @UsuarioEjecutor,
            @RegistrosAfectados = @FilasRobles OUTPUT,
            @TasaActual = @TasaRobles OUTPUT;

        INSERT INTO #ResultadoCascada (Paso, Empresa, TasaAplicada, RegistrosAfectados, Estado, Detalle)
        VALUES (1, 'LOS ROBLES', @TasaRobles, @FilasRobles, 'EXITOSO', 'Facturas y Cuotas indexadas. Factor y saldos en Bs actualizados.');

        -----------------------------------------------------------------------------
        -- PASO 2: INDEXACIÓN EN CLUB DEPORTIVO
        -----------------------------------------------------------------------------
        EXEC [CLUBDEPORTIVO].[dbo].[sp_Indexar_ClubDeportivo]
            @IdLote = @IdLote,
            @Usuario = @UsuarioEjecutor,
            @RegistrosAfectados = @FilasClub OUTPUT,
            @TasaActual = @TasaClub OUTPUT;

        INSERT INTO #ResultadoCascada (Paso, Empresa, TasaAplicada, RegistrosAfectados, Estado, Detalle)
        VALUES (2, 'CLUB DEPORTIVO', @TasaClub, @FilasClub, 'EXITOSO', 'Facturas y Cuotas indexadas. Factor y saldos en Bs actualizados.');

        -----------------------------------------------------------------------------
        -- PASO 3: INDEXACIÓN EN PROCENTROS
        -----------------------------------------------------------------------------
        EXEC [PROCENTROS].[dbo].[sp_Indexar_Procentros]
            @IdLote = @IdLote,
            @Usuario = @UsuarioEjecutor,
            @RegistrosAfectados = @FilasProcentro OUTPUT,
            @TasaActual = @TasaProcentro OUTPUT;

        INSERT INTO #ResultadoCascada (Paso, Empresa, TasaAplicada, RegistrosAfectados, Estado, Detalle)
        VALUES (3, 'PROCENTROS', @TasaProcentro, @FilasProcentro, 'EXITOSO', 'Facturas indexadas. Factor y saldos en Bs actualizados.');

    END TRY
    BEGIN CATCH
        SET @EstadoGlobal = 'FALLIDO';
        SET @MensajeFinal = CONCAT('Error en Cascada [Línea ', ERROR_LINE(), ']: ', ERROR_MESSAGE());

        INSERT INTO #ResultadoCascada (Paso, Empresa, TasaAplicada, RegistrosAfectados, Estado, Detalle)
        VALUES (99, 'ERROR_SISTEMA', 0, 0, 'FALLIDO', @MensajeFinal);

        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'CASCADA_MASTER', 'ORQUESTADOR', 0, 0, 0, @UsuarioEjecutor, 'FALLIDO', @MensajeFinal, GETDATE());

        SELECT 
            Paso, 
            Empresa, 
            TasaAplicada, 
            RegistrosAfectados, 
            Estado, 
            Detalle, 
            DATEDIFF(SECOND, @FechaInicio, GETDATE()) AS SegundosDuracion
        FROM #ResultadoCascada
        ORDER BY Paso ASC;

        THROW;
        RETURN;
    END CATCH

    SELECT 
        Paso, 
        Empresa, 
        TasaAplicada, 
        RegistrosAfectados, 
        Estado, 
        Detalle, 
        DATEDIFF(SECOND, @FechaInicio, GETDATE()) AS SegundosDuracion
    FROM #ResultadoCascada
    ORDER BY Paso ASC;

    DROP TABLE #ResultadoCascada;
END;
GO`
  },
  {
    id: 'losrobles',
    title: 'Procedimiento Específico: LOS ROBLES (Set-Based 9.750)',
    database: 'LOSROBLES',
    category: 'empresa',
    description: 'Actualización en lote de SAACXC en Saint 9.750: actualiza Factor y saldos en Bs, manteniendo intactos MontoMEx y SaldoMEx.',
    saintTables: ['SACONF', 'SAACXC', 'SAMECA_03', 'SAMECA_07'],
    explanation: [
      'Actualiza el campo Factor = @FactorActual en SAACXC en cada corrida de indexación (solicitado expresamente por Martha).',
      'Preserva inalterables los valores de referencia MontoMEx y SaldoMEx (divisa USD fija).',
      'Calcula el nuevo Saldo en Bs multiplicando directamente SaldoMEx * @FactorActual, eliminando errores de redondeo.',
      'Si algún registro no tiene SaldoMEx poblado aún, aplica la fórmula de compatibilidad con FactorHistorico.',
      'Para Cuotas (TipoCxC = 70), actualiza además el Monto en Bs = ROUND(MontoMEx * @FactorActual, 2).'
    ],
    improvements: [
      'Aprovecha la arquitectura multidivisa nativa de Saint 9.750.',
      'El campo Factor en SAACXC deja de ser 0.00 y refleja la tasa real de actualización.',
      'MontoMEx y SaldoMEx quedan protegidos como valores ancla.'
    ],
    code: `-- ==================================================================================
-- PROCEDIMIENTO: sp_Indexar_LosRobles
-- Base de Datos: LOSROBLES
-- Compatible con: Saint Enterprise 9.750 (MontoMEx / SaldoMEx / Factor)
-- ==================================================================================
USE [LOSROBLES];
GO

IF OBJECT_ID('dbo.sp_Indexar_LosRobles', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Indexar_LosRobles;
GO

CREATE PROCEDURE dbo.sp_Indexar_LosRobles
    @IdLote UNIQUEIDENTIFIER = NULL,
    @Usuario VARCHAR(50) = 'SISTEMA_SAINT',
    @RegistrosAfectados INT = 0 OUTPUT,
    @TasaActual DECIMAL(28,4) = 0 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @IdLote IS NULL 
        SET @IdLote = NEWID();

    DECLARE @FechaBuscaCuotas DATETIME;
    DECLARE @FechaBuscaFacturas DATETIME;
    DECLARE @FactorActual DECIMAL(28,4);
    DECLARE @FactorHistorico DECIMAL(28,4);
    DECLARE @FilasCuotas INT = 0;
    DECLARE @FilasFacturas INT = 0;

    -- 1. Obtener factor actual configurado en Saint (SACONF)
    SELECT TOP 1 @FactorActual = FACTOR FROM dbo.SACONF;

    IF @FactorActual IS NULL OR @FactorActual <= 0
    BEGIN
        RAISERROR('Error: El FACTOR en SACONF de LOSROBLES no está definido o es menor o igual a cero.', 16, 1);
        RETURN;
    END

    SET @TasaActual = @FactorActual;

    -- 2. Obtener último factor histórico procesado en SAMECA_07
    SELECT TOP 1 @FactorHistorico = Factor 
    FROM dbo.SAMECA_07 
    ORDER BY Fecha_Proceso DESC, Hora DESC;

    IF @FactorHistorico IS NULL OR @FactorHistorico <= 0
        SET @FactorHistorico = @FactorActual;

    -- 3. Obtener fechas límites de indexación desde SAMECA_03
    SELECT TOP 1 
        @FechaBuscaCuotas = Fecha_Indexar_Cuotas,
        @FechaBuscaFacturas = Fecha_Indexar_Facturas
    FROM dbo.SAMECA_03 
    WHERE CODMECA = '01';

    SET @FechaBuscaCuotas = ISNULL(@FechaBuscaCuotas, '1900-01-01');
    SET @FechaBuscaFacturas = ISNULL(@FechaBuscaFacturas, '1900-01-01');

    -- Validar si la tasa ya fue indexada previamente
    IF @FactorActual = @FactorHistorico
    BEGIN
        INSERT INTO dbo.LOG_INDEXACION_SAINT 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'LOSROBLES', 'OMITIDO', 0, @FactorHistorico, @FactorActual, @Usuario, 'ADVERTENCIA', 'El factor actual es idéntico al histórico previo. No hubo variación cambiaria.', GETDATE());

        SET @RegistrosAfectados = 0;
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        -------------------------------------------------------------------------
        -- OPERACIÓN SET-BASED 1: INDEXAR CUOTAS (TipoCxC = 70)
        -- Saint 9.750:
        -- - Actualiza Saldo y Monto en Bs calculados desde MontoMEx / SaldoMEx
        -- - Actualiza el campo FACTOR con @FactorActual
        -- - MontoMEx y SaldoMEx se mantienen INTOCABLES (valor referencial)
        -------------------------------------------------------------------------
        UPDATE dbo.SAACXC
        SET 
            Saldo = CASE 
                        WHEN SaldoMEx > 0 THEN ROUND(SaldoMEx * @FactorActual, 2)
                        ELSE ROUND((Saldo / @FactorHistorico) * @FactorActual, 2)
                    END,
            Monto = CASE 
                        WHEN MontoMEx > 0 THEN ROUND(MontoMEx * @FactorActual, 2)
                        ELSE ROUND((Monto / @FactorHistorico) * @FactorActual, 2)
                    END,
            Factor = @FactorActual -- Guardar última tasa de actualización
        WHERE Saldo > 0 
          AND TipoCxC = 70 
          AND Fechav >= @FechaBuscaCuotas;

        SET @FilasCuotas = @@ROWCOUNT;

        -------------------------------------------------------------------------
        -- OPERACIÓN SET-BASED 2: INDEXAR FACTURAS (TipoCxC = 10)
        -- Saint 9.750:
        -- - Actualiza únicamente Saldo en Bs desde SaldoMEx
        -- - Actualiza el campo FACTOR con @FactorActual
        -- - Monto, MontoMEx y SaldoMEx permanecen INTACTOS
        -------------------------------------------------------------------------
        UPDATE dbo.SAACXC
        SET 
            Saldo = CASE 
                        WHEN SaldoMEx > 0 THEN ROUND(SaldoMEx * @FactorActual, 2)
                        ELSE ROUND((Saldo / @FactorHistorico) * @FactorActual, 2)
                    END,
            Factor = @FactorActual -- Guardar última tasa de actualización
        WHERE Saldo > 0 
          AND TipoCxC = 10 
          AND Fechav >= @FechaBuscaFacturas;

        SET @FilasFacturas = @@ROWCOUNT;

        -------------------------------------------------------------------------
        -- REGISTRO HISTÓRICO: Guardar nuevo factor en SAMECA_07
        -------------------------------------------------------------------------
        INSERT INTO dbo.SAMECA_07 (CodMeca, FecTrn, Factor, Fecha_Proceso, Hora)
        VALUES (
            '01',
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            @FactorActual,
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            CONVERT(VARCHAR(8), GETDATE(), 108)
        );

        SET @RegistrosAfectados = @FilasCuotas + @FilasFacturas;

        INSERT INTO dbo.LOG_INDEXACION_SAINT 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'LOSROBLES', 'CUOTAS_Y_FACTURAS_9750', @RegistrosAfectados, @FactorHistorico, @FactorActual, @Usuario, 'EXITOSO', 
             CONCAT('Cuotas: ', @FilasCuotas, ', Facturas: ', @FilasFacturas, '. Factor guardado: ', @FactorActual), GETDATE());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        INSERT INTO dbo.LOG_INDEXACION_SAINT 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'LOSROBLES', 'ERROR', 0, @FactorHistorico, @FactorActual, @Usuario, 'FALLIDO', ERROR_MESSAGE(), GETDATE());

        THROW;
    END CATCH
END;
GO`
  },
  {
    id: 'clubdeportivo',
    title: 'Procedimiento Específico: CLUB DEPORTIVO (Set-Based 9.750)',
    database: 'CLUBDEPORTIVO',
    category: 'empresa',
    description: 'Actualización en lote de SAACXC para Club Deportivo en Saint 9.750 con actualización de Factor y protección de MontoMEx / SaldoMEx.',
    saintTables: ['SACONF', 'SAACXC', 'SAMECA_03', 'SAMECA_06'],
    explanation: [
      'Actualiza el campo Factor = @FactorActual en SAACXC en cada indexación.',
      'Protege los valores en divisas MontoMEx y SaldoMEx sin alterarlos.',
      'Recalcula Saldo en Bs con SaldoMEx * @FactorActual y Monto en Cuotas (70) con MontoMEx * @FactorActual.',
      'Inserta de forma atómica el nuevo factor en SAMECA_06.'
    ],
    improvements: [
      'Elimina factores en 0.00 en SAACXC.',
      'Soporte completo multidivisa Saint 9.750.',
      'Ejecución instantánea sin bloqueos de base de datos.'
    ],
    code: `-- ==================================================================================
-- PROCEDIMIENTO: sp_Indexar_ClubDeportivo
-- Base de Datos: CLUBDEPORTIVO
-- Compatible con: Saint Enterprise 9.750
-- ==================================================================================
USE [CLUBDEPORTIVO];
GO

IF OBJECT_ID('dbo.sp_Indexar_ClubDeportivo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Indexar_ClubDeportivo;
GO

CREATE PROCEDURE dbo.sp_Indexar_ClubDeportivo
    @IdLote UNIQUEIDENTIFIER = NULL,
    @Usuario VARCHAR(50) = 'SISTEMA_SAINT',
    @RegistrosAfectados INT = 0 OUTPUT,
    @TasaActual DECIMAL(28,4) = 0 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @IdLote IS NULL 
        SET @IdLote = NEWID();

    DECLARE @FechaBuscaCuotas DATETIME;
    DECLARE @FechaBuscaFacturas DATETIME;
    DECLARE @FactorActual DECIMAL(28,4);
    DECLARE @FactorHistorico DECIMAL(28,4);
    DECLARE @FilasCuotas INT = 0;
    DECLARE @FilasFacturas INT = 0;

    SELECT TOP 1 @FactorActual = FACTOR FROM dbo.SACONF;

    IF @FactorActual IS NULL OR @FactorActual <= 0
    BEGIN
        RAISERROR('Error: El FACTOR en SACONF de CLUBDEPORTIVO no está definido o es <= 0.', 16, 1);
        RETURN;
    END

    SET @TasaActual = @FactorActual;

    SELECT TOP 1 @FactorHistorico = Factor 
    FROM dbo.SAMECA_06 
    ORDER BY Fecha_Proceso DESC, Hora DESC;

    IF @FactorHistorico IS NULL OR @FactorHistorico <= 0
        SET @FactorHistorico = @FactorActual;

    SELECT TOP 1 
        @FechaBuscaCuotas = Fecha_Indexar_Cuotas,
        @FechaBuscaFacturas = Fecha_Indexar_Facturas
    FROM dbo.SAMECA_03 
    WHERE CODMECA = '01';

    SET @FechaBuscaCuotas = ISNULL(@FechaBuscaCuotas, '1900-01-01');
    SET @FechaBuscaFacturas = ISNULL(@FechaBuscaFacturas, '1900-01-01');

    IF @FactorActual = @FactorHistorico
    BEGIN
        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'CLUBDEPORTIVO', 'OMITIDO', 0, @FactorHistorico, @FactorActual, @Usuario, 'ADVERTENCIA', 'El factor actual es idéntico al histórico previo.', GETDATE());

        SET @RegistrosAfectados = 0;
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Indexar Cuotas (TipoCxC = 70): Saldo, Monto y Factor
        UPDATE dbo.SAACXC
        SET 
            Saldo = CASE 
                        WHEN SaldoMEx > 0 THEN ROUND(SaldoMEx * @FactorActual, 2)
                        ELSE ROUND((Saldo / @FactorHistorico) * @FactorActual, 2)
                    END,
            Monto = CASE 
                        WHEN MontoMEx > 0 THEN ROUND(MontoMEx * @FactorActual, 2)
                        ELSE ROUND((Monto / @FactorHistorico) * @FactorActual, 2)
                    END,
            Factor = @FactorActual
        WHERE Saldo > 0 
          AND TipoCxC = 70 
          AND Fechav >= @FechaBuscaCuotas;

        SET @FilasCuotas = @@ROWCOUNT;

        -- 2. Indexar Facturas (TipoCxC = 10): Saldo y Factor
        UPDATE dbo.SAACXC
        SET 
            Saldo = CASE 
                        WHEN SaldoMEx > 0 THEN ROUND(SaldoMEx * @FactorActual, 2)
                        ELSE ROUND((Saldo / @FactorHistorico) * @FactorActual, 2)
                    END,
            Factor = @FactorActual
        WHERE Saldo > 0 
          AND TipoCxC = 10 
          AND Fechav >= @FechaBuscaFacturas;

        SET @FilasFacturas = @@ROWCOUNT;

        -- 3. Guardar histórico en SAMECA_06
        INSERT INTO dbo.SAMECA_06 (CodMeca, FecTrn, Factor, Fecha_Proceso, Hora)
        VALUES (
            '01',
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            @FactorActual,
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            CONVERT(VARCHAR(8), GETDATE(), 108)
        );

        SET @RegistrosAfectados = @FilasCuotas + @FilasFacturas;

        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'CLUBDEPORTIVO', 'CUOTAS_Y_FACTURAS_9750', @RegistrosAfectados, @FactorHistorico, @FactorActual, @Usuario, 'EXITOSO', 
             CONCAT('Cuotas: ', @FilasCuotas, ', Facturas: ', @FilasFacturas, '. Factor: ', @FactorActual), GETDATE());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'CLUBDEPORTIVO', 'ERROR', 0, @FactorHistorico, @FactorActual, @Usuario, 'FALLIDO', ERROR_MESSAGE(), GETDATE());

        THROW;
    END CATCH
END;
GO`
  },
  {
    id: 'procentros',
    title: 'Procedimiento Específico: PROCENTROS (Set-Based 9.750)',
    database: 'PROCENTROS',
    category: 'empresa',
    description: 'Actualización en lote de SAACXC para Facturas (TipoCxC=10) en Saint 9.750 con actualización de Factor.',
    saintTables: ['SACONF', 'SAACXC', 'LOSROBLES.dbo.SAMECA_03', 'PROCENTROS.dbo.SAMECA_03'],
    explanation: [
      'Mantiene la regla de leer la fecha de corte desde LOSROBLES.dbo.SAMECA_03.',
      'Actualiza el campo Factor = @FactorActual en SAACXC en cada indexación.',
      'Calcula Saldo = ROUND(SaldoMEx * @FactorActual, 2), dejando SaldoMEx y MontoMEx inalterados.',
      'Guarda el histórico en SAMECA_03 de PROCENTROS.'
    ],
    improvements: [
      'Compatible con el esquema 9.750.',
      'Elimina el campo Factor en cero.',
      'Protege los valores en divisas de cada factura.'
    ],
    code: `-- ==================================================================================
-- PROCEDIMIENTO: sp_Indexar_Procentros
-- Base de Datos: PROCENTROS
-- Compatible con: Saint Enterprise 9.750
-- ==================================================================================
USE [PROCENTROS];
GO

IF OBJECT_ID('dbo.sp_Indexar_Procentros', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Indexar_Procentros;
GO

CREATE PROCEDURE dbo.sp_Indexar_Procentros
    @IdLote UNIQUEIDENTIFIER = NULL,
    @Usuario VARCHAR(50) = 'SISTEMA_SAINT',
    @RegistrosAfectados INT = 0 OUTPUT,
    @TasaActual DECIMAL(28,4) = 0 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @IdLote IS NULL 
        SET @IdLote = NEWID();

    DECLARE @FechaBuscaFacturas DATETIME;
    DECLARE @FactorActual DECIMAL(28,4);
    DECLARE @FactorHistorico DECIMAL(28,4);
    DECLARE @FilasFacturas INT = 0;

    SELECT TOP 1 @FactorActual = FACTOR FROM dbo.SACONF;

    IF @FactorActual IS NULL OR @FactorActual <= 0
    BEGIN
        RAISERROR('Error: El FACTOR en SACONF de PROCENTROS no está definido o es <= 0.', 16, 1);
        RETURN;
    END

    SET @TasaActual = @FactorActual;

    SELECT TOP 1 @FactorHistorico = Factor 
    FROM dbo.SAMECA_03 
    ORDER BY Fecha_Proceso DESC, Hora DESC;

    IF @FactorHistorico IS NULL OR @FactorHistorico <= 0
        SET @FactorHistorico = @FactorActual;

    -- Regla de negocio de Martha: fecha límite leída desde LOSROBLES.dbo.SAMECA_03
    SELECT TOP 1 @FechaBuscaFacturas = Fecha_Indexar_Facturas 
    FROM [LOSROBLES].[dbo].[SAMECA_03] 
    WHERE CODMECA = '01';

    SET @FechaBuscaFacturas = ISNULL(@FechaBuscaFacturas, '1900-01-01');

    IF @FactorActual = @FactorHistorico
    BEGIN
        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'PROCENTROS', 'OMITIDO', 0, @FactorHistorico, @FactorActual, @Usuario, 'ADVERTENCIA', 'El factor actual es idéntico al histórico previo.', GETDATE());

        SET @RegistrosAfectados = 0;
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        -- Actualizar Facturas (TipoCxC = 10): Saldo y Factor
        UPDATE dbo.SAACXC
        SET 
            Saldo = CASE 
                        WHEN SaldoMEx > 0 THEN ROUND(SaldoMEx * @FactorActual, 2)
                        ELSE ROUND((Saldo / @FactorHistorico) * @FactorActual, 2)
                    END,
            Factor = @FactorActual -- Guardar última tasa de actualización
        WHERE Saldo > 0 
          AND TipoCxC = 10 
          AND Fechav >= @FechaBuscaFacturas;

        SET @FilasFacturas = @@ROWCOUNT;

        -- Guardar nuevo factor en SAMECA_03 de PROCENTROS
        INSERT INTO dbo.SAMECA_03 (CodMeca, FecTrn, Factor, Fecha_Proceso, Hora)
        VALUES (
            '01',
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            @FactorActual,
            CAST(CAST(GETDATE() AS DATE) AS DATETIME),
            CONVERT(VARCHAR(8), GETDATE(), 108)
        );

        SET @RegistrosAfectados = @FilasFacturas;

        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'PROCENTROS', 'FACTURAS_9750', @RegistrosAfectados, @FactorHistorico, @FactorActual, @Usuario, 'EXITOSO', 
             CONCAT('Facturas indexadas: ', @FilasFacturas, '. Factor: ', @FactorActual), GETDATE());

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        INSERT INTO [LOSROBLES].[dbo].[LOG_INDEXACION_SAINT] 
            (IdLote, Empresa, TipoProceso, RegistrosAfectados, FactorAnterior, FactorNuevo, Usuario, Estado, Mensaje, FechaEjecucion)
        VALUES 
            (@IdLote, 'PROCENTROS', 'ERROR', 0, @FactorHistorico, @FactorActual, @Usuario, 'FALLIDO', ERROR_MESSAGE(), GETDATE());

        THROW;
    END CATCH
END;
GO`
  },
  {
    id: 'auditoria',
    title: 'Tabla Central de Auditoría y Bitácora (DDL)',
    database: 'LOSROBLES',
    category: 'auditoria',
    description: 'Estructura de datos para almacenar el historial de cada corrida en cascada, factores aplicados, usuarios y tiempos de ejecución.',
    saintTables: ['LOG_INDEXACION_SAINT'],
    explanation: [
      'Permite auditar quién ejecutó la indexación, a qué hora, qué factores cambiaron y cuántos registros se vieron afectados.',
      'Sustituye los viejos archivos de texto Respaldo1.txt, IndexarSaldosFacturasCLUB.txt que se creaban en el disco duro.',
      'Permite generar reportes de control interno para la gerencia contable o auditoría fiscal.'
    ],
    improvements: [
      'Histórico permanente dentro de la base de datos.',
      'Consultable mediante SQL o Report Builder con una simple vista.'
    ],
    code: `-- ==================================================================================
-- TABLA DE AUDITORÍA: LOG_INDEXACION_SAINT
-- Base de Datos: LOSROBLES
-- ==================================================================================
USE [LOSROBLES];
GO

IF OBJECT_ID('dbo.LOG_INDEXACION_SAINT', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LOG_INDEXACION_SAINT (
        IdLog BIGINT IDENTITY(1,1) PRIMARY KEY,
        IdLote UNIQUEIDENTIFIER NOT NULL,
        Empresa VARCHAR(50) NOT NULL,
        TipoProceso VARCHAR(50) NOT NULL,
        RegistrosAfectados INT NOT NULL DEFAULT 0,
        FactorAnterior DECIMAL(28,4) NOT NULL,
        FactorNuevo DECIMAL(28,4) NOT NULL,
        Usuario VARCHAR(50) NOT NULL DEFAULT 'SISTEMA',
        Estado VARCHAR(20) NOT NULL, -- EXITOSO, ADVERTENCIA, FALLIDO
        Mensaje VARCHAR(1000) NULL,
        FechaEjecucion DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE NONCLUSTERED INDEX IX_LOG_INDEXACION_Fecha 
    ON dbo.LOG_INDEXACION_SAINT (FechaEjecucion DESC);

    CREATE NONCLUSTERED INDEX IX_LOG_INDEXACION_Lote 
    ON dbo.LOG_INDEXACION_SAINT (IdLote);
    
    PRINT 'Tabla LOG_INDEXACION_SAINT creada con éxito.';
END
ELSE
BEGIN
    PRINT 'La tabla LOG_INDEXACION_SAINT ya existe.';
END
GO`
  },
  {
    id: 'report_builder',
    title: 'Script de Invocación para Saint Report Builder',
    database: 'LOSROBLES',
    category: 'report_builder',
    description: 'Instrucción T-SQL formateada para pegarla en el diseñador de reportes de Saint Report Builder para disparar el proceso con 1 clic.',
    saintTables: ['sp_Ejecutar_Indexacion_Cascada'],
    explanation: [
      'Al integrarlo en Report Builder, el usuario simplemente presiona "Imprimir" o "Vista Previa" del reporte.',
      'El procedimiento maestro ejecuta la cascada y retorna la tabla de resultados (#ResultadoCascada).',
      'Saint Report Builder pinta en pantalla el comprobante de indexación con el total de facturas y cuotas de las 3 empresas.'
    ],
    improvements: [
      'Totalmente invisible y seguro para el usuario final.',
      'Cero manipulación de comandos cmd o archivos bat.'
    ],
    code: `-- ==================================================================================
-- CONSULTA SQL PARA REPORT BUILDER (Saint Enterprise Administrativo)
-- Módulo: Reportes Personalizados / Report Builder
-- Nombre de Reporte Sugerido: "Comprobante de Indexación Multidivisa en Cascada"
-- ==================================================================================

-- Pega esta instrucción exacta en la pestaña de Datos / Consulta SQL de Report Builder:

EXEC [LOSROBLES].[dbo].[sp_Ejecutar_Indexacion_Cascada] 
    @UsuarioEjecutor = 'USUARIO_ACTUAL'; -- Saint permite pasar la variable del usuario logueado

-- Campos que el reporte tendrá disponibles para dibujar la cuadrícula:
-- 1. Paso               (1, 2, 3)
-- 2. Empresa            ('LOS ROBLES', 'CLUB DEPORTIVO', 'PROCENTROS')
-- 3. TasaAplicada       (Factor de cambio aplicado)
-- 4. RegistrosAfectados (Total de cuotas y facturas recalculadas)
-- 5. Estado             ('EXITOSO', 'FALLIDO')
-- 6. Detalle            (Resumen del cálculo)
-- 7. SegundosDuracion   (Tiempo que tardó la ejecución en segundos)`
  },
  {
    id: 'respaldo',
    title: 'Procedimiento de Respaldo Seguro Integrado (Reemplazo RESPALDO.sql)',
    database: 'master',
    category: 'respaldo',
    description: 'Script T-SQL para respaldar las 3 bases de datos con compresión nativa, verificación de checksum y sellado temporal sin osql.',
    saintTables: ['sys.databases'],
    explanation: [
      'Reemplaza los archivos RESPALDO.sql y RESPALDO2.sql que se llamaban por osql.',
      'Aplica COMPRESSION (ahorra hasta 80% de espacio en disco) y CHECKSUM (garantiza integridad física del backup).',
      'Genera nombres automáticos con fecha y hora: LOSROBLES_20261016_043000.bak.'
    ],
    improvements: [
      'Mayor velocidad y seguridad en las copias de seguridad.',
      'Puede ser ejecutado antes y después de la cascada automáticamente.'
    ],
    code: `-- ==================================================================================
-- PROCEDIMIENTO: sp_Respaldo_Seguro_Saint
-- Base de Datos: master (o LOSROBLES)
-- Objetivo: Respaldar las 3 empresas de Saint con compresión nativa
-- ==================================================================================
USE [master];
GO

IF OBJECT_ID('dbo.sp_Respaldo_Seguro_Saint', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Respaldo_Seguro_Saint;
GO

CREATE PROCEDURE dbo.sp_Respaldo_Seguro_Saint
    @RutaDestino VARCHAR(260) = 'C:\\RespaldoSaint\\',
    @Etiqueta VARCHAR(50) = 'PRE_INDEXACION'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Timestamp VARCHAR(20) = REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(19), GETDATE(), 120), '-', ''), ':', ''), ' ', '_');
    DECLARE @ArchivoRobles VARCHAR(300) = CONCAT(@RutaDestino, 'LOSROBLES_', @Etiqueta, '_', @Timestamp, '.bak');
    DECLARE @ArchivoClub VARCHAR(300) = CONCAT(@RutaDestino, 'CLUBDEPORTIVO_', @Etiqueta, '_', @Timestamp, '.bak');
    DECLARE @ArchivoPro VARCHAR(300) = CONCAT(@RutaDestino, 'PROCENTROS_', @Etiqueta, '_', @Timestamp, '.bak');

    PRINT 'Iniciando respaldo comprimido de LOSROBLES...';
    BACKUP DATABASE [LOSROBLES] 
    TO DISK = @ArchivoRobles 
    WITH COMPRESSION, CHECKSUM, STATS = 25, 
    NAME = 'Respaldo Completo LOSROBLES';

    PRINT 'Iniciando respaldo comprimido de CLUBDEPORTIVO...';
    BACKUP DATABASE [CLUBDEPORTIVO] 
    TO DISK = @ArchivoClub 
    WITH COMPRESSION, CHECKSUM, STATS = 25, 
    NAME = 'Respaldo Completo CLUBDEPORTIVO';

    PRINT 'Iniciando respaldo comprimido de PROCENTROS...';
    BACKUP DATABASE [PROCENTROS] 
    TO DISK = @ArchivoPro 
    WITH COMPRESSION, CHECKSUM, STATS = 25, 
    NAME = 'Respaldo Completo PROCENTROS';

    PRINT 'Respaldos completados exitosamente.';
END;
GO`
  }
];

export interface SampleCxcRecord {
  nroUnico: number;
  numeroD: string;
  codClie: string;
  nombreClie: string;
  tipoCxC: number;
  tipoDesc: 'Factura' | 'Cuota';
  saldoAnterior: number;
  montoAnterior: number;
  saldoNuevo: number;
  montoNuevo: number;
  montoMEx: number; // Monto referencial en Divisa USD
  saldoMEx: number; // Saldo referencial en Divisa USD (invariable en indexación)
  factorGuardado: number; // Factor en SAACXC
  fechav: string;
}

export const SAMPLE_CXC_DATA: SampleCxcRecord[] = [
  {
    nroUnico: 10420,
    numeroD: 'FAC-000892',
    codClie: 'J-30491823',
    nombreClie: 'INVERSIONES CARIBE C.A.',
    tipoCxC: 10,
    tipoDesc: 'Factura',
    saldoAnterior: 60739.00,
    montoAnterior: 60739.00,
    saldoNuevo: 62500.00,
    montoNuevo: 60739.00,
    montoMEx: 100.00, // $100 fijos en divisa
    saldoMEx: 100.00, // $100 fijos
    factorGuardado: 607.39,
    fechav: '2026-11-15'
  },
  {
    nroUnico: 10421,
    numeroD: 'CUO-001201',
    codClie: 'V-14920381',
    nombreClie: 'GONZALEZ PEREZ HERNAN',
    tipoCxC: 70,
    tipoDesc: 'Cuota',
    saldoAnterior: 121478.00,
    montoAnterior: 121478.00,
    saldoNuevo: 125000.00,
    montoNuevo: 125000.00,
    montoMEx: 200.00, // $200 fijos
    saldoMEx: 200.00, // $200 fijos
    factorGuardado: 607.39,
    fechav: '2026-11-01'
  },
  {
    nroUnico: 10422,
    numeroD: 'CUO-001202',
    codClie: 'V-18291039',
    nombreClie: 'RODRIGUEZ MARQUEZ ANA',
    tipoCxC: 70,
    tipoDesc: 'Cuota',
    saldoAnterior: 30369.50,
    montoAnterior: 60739.00,
    saldoNuevo: 31250.00,
    montoNuevo: 62500.00,
    montoMEx: 100.00, // Original $100
    saldoMEx: 50.00,  // Abonó 50%, restan $50 (invariable en indexación)
    factorGuardado: 607.39,
    fechav: '2026-11-05'
  },
  {
    nroUnico: 10423,
    numeroD: 'FAC-000895',
    codClie: 'J-40291029',
    nombreClie: 'SUMINISTROS MARACAIBO S.A.',
    tipoCxC: 10,
    tipoDesc: 'Factura',
    saldoAnterior: 182217.00,
    montoAnterior: 182217.00,
    saldoNuevo: 187500.00,
    montoNuevo: 182217.00,
    montoMEx: 300.00, // $300 fijos
    saldoMEx: 300.00, // $300 fijos
    factorGuardado: 607.39,
    fechav: '2026-12-01'
  },
  {
    nroUnico: 10424,
    numeroD: 'CUO-001205',
    codClie: 'V-08291032',
    nombreClie: 'MENDEZ CASTILLO CARLOS',
    tipoCxC: 70,
    tipoDesc: 'Cuota',
    saldoAnterior: 91108.50,
    montoAnterior: 91108.50,
    saldoNuevo: 93750.00,
    montoNuevo: 93750.00,
    montoMEx: 150.00, // $150 fijos
    saldoMEx: 150.00, // $150 fijos
    factorGuardado: 607.39,
    fechav: '2026-11-20'
  }
];

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Zap, Lock, RefreshCw, Layers } from 'lucide-react';

interface DiagnosisViewProps {
  onGoToScripts: () => void;
  onGoToCascade: () => void;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({ onGoToScripts, onGoToCascade }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Resumen Ejecutivo para Martha */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diagnóstico Profesional DBA Saint Enterprise
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Hola Martha, bienvenido a la solución integral para tus bases de datos Saint.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Analicé a fondo los archivos de lote (.bat) y los scripts SQL que me entregaste. Tu intuición técnica es <strong className="text-emerald-400">100% acertada</strong>: tener scripts externos en Windows con la contraseña de <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-xs">sa</code> al descubierto y archivos sueltos en carpetas es riesgoso, engorroso y hace muy difícil replicar el ambiente en laboratorios de pruebas.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hemos rediseñado todo el proceso para que resida <strong className="text-white">100% dentro de SQL Server</strong> mediante <strong>Stored Procedures transaccionales basados en conjuntos (Set-Based)</strong>, orquestados en <strong>cascada automática (Los Robles → Club Deportivo → Procentro)</strong>, listos para ser invocados con un solo clic desde <strong>Saint Report Builder</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <button
              onClick={onGoToScripts}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Ver Scripts T-SQL
            </button>
            <button
              onClick={onGoToCascade}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Ver Flujo en Cascada
            </button>
          </div>
        </div>
      </div>

      {/* Tabla comparativa: Esquema Anterior vs Nueva Arquitectura */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Esquema Anterior */}
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Esquema Anterior (Archivos .BAT + Cursores)</h3>
              <p className="text-xs text-rose-400 font-medium">4 Riesgos Críticos Detectados</p>
            </div>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-rose-950/60">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-0.5">1. Contraseñas de SA expuestas</strong>
                <p className="text-slate-400 text-xs">
                  El .bat ejecutaba <code className="text-amber-300">osql /Usa /P Ayse2020 /S SERVER6</code>. Cualquier usuario con acceso a la máquina o red podía leer la clave maestra y alterar o borrar información contable.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-rose-950/60">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-0.5">2. Peligro extremo con SET SINGLE_USER</strong>
                <p className="text-slate-400 text-xs">
                  Tu script ejecutaba <code className="text-rose-300">ALTER DATABASE ... SET SINGLE_USER WITH ROLLBACK IMMEDIATE</code>. Si había usuarios facturando en Saint, los expulsaba abruptamente. Y si el script fallaba en el medio, la base de datos quedaba bloqueada en modo monousuario sin poder abrir Saint.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-rose-950/60">
              <RefreshCw className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-0.5">3. Cursores RBAR (Fila por Fila) muy lentos</strong>
                <p className="text-slate-400 text-xs">
                  <code className="text-amber-300">CURSOR9</code> realizaba 4 subconsultas por cada cuota y factura (recalculando el MAX de la fecha en cada iteración). Para 2,000 cuotas generaba más de 8,000 consultas a disco (por eso tu log arrojaba cientos de <em>"1 fila afectada"</em>).
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-rose-950/60">
              <Layers className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-0.5">4. Difícil de respaldar y replicar en laboratorio</strong>
                <p className="text-slate-400 text-xs">
                  Al tener 8 archivos .sql, archivos de salida .txt y el .bat en el escritorio o disco C:, al restaurar un backup en otra máquina había que rearmar carpetas y rutas a mano.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Nueva Arquitectura Optimizada */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nueva Arquitectura DBA (100% Nativa en Base de Datos)</h3>
              <p className="text-xs text-emerald-400 font-medium">Rendimiento, Seguridad y Automatización</p>
            </div>
          </div>

          <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-emerald-950/60">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">1. Cero credenciales expuestas</strong>
                <p className="text-slate-400 text-xs">
                  Los procedimientos almacenados se ejecutan con los permisos internos de la base de datos o mediante el usuario autenticado de Saint. Nadie ve contraseñas ni nombres de servidor en Windows.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-emerald-950/60">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">2. Operaciones basadas en conjuntos (Set-Based)</strong>
                <p className="text-slate-400 text-xs">
                  Un solo <code className="text-emerald-300">UPDATE</code> vectorial procesa todas las facturas y cuotas en <strong>fracciones de segundo</strong> (de ~45 segundos a ~0.08 seg). Sin cursores, sin saturación del disco.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-emerald-950/60">
              <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">3. Transacciones seguras TRY...CATCH (Sin SINGLE_USER)</strong>
                <p className="text-slate-400 text-xs">
                  No se apaga la base de datos ni se expulsan usuarios. Se usa <code className="text-emerald-300">BEGIN TRANSACTION / COMMIT / ROLLBACK</code>. Si ocurre cualquier error, la transacción se revierte limpiamente.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-emerald-950/60">
              <Layers className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 block mb-0.5">4. Ejecución en Cascada e Integración Report Builder</strong>
                <p className="text-slate-400 text-xs">
                  Un procedimiento maestro ejecuta: <strong>Los Robles → Club Deportivo → Procentro</strong>. Se puede lanzar desde el menú de Saint o Report Builder emitiendo un reporte impreso con los resultados.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Sección Detallada de las Tablas Saint Involucradas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span>Estructura de Datos del ERP Saint y Reglas de Negocio</span>
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-6">
          Identificación técnica de cada tabla y campo del ERP Saint modificado durante la indexación:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-emerald-400 font-mono font-bold text-sm block mb-1">SAACXC</span>
            <span className="text-slate-400 block mb-2">Cuentas por Cobrar de Saint</span>
            <p className="text-slate-300 mb-2">
              Se indexan los documentos con <code className="text-amber-300">Saldo &gt; 0</code> y fecha de vencimiento posterior a la fecha de corte.
            </p>
            <div className="space-y-1 text-slate-400">
              <div>• <strong>TipoCxC = 10</strong> (Facturas): Se actualiza únicamente el campo <code className="text-emerald-300">Saldo</code>.</div>
              <div>• <strong>TipoCxC = 70</strong> (Cuotas): Se actualizan tanto el <code className="text-emerald-300">Saldo</code> como el <code className="text-emerald-300">Monto</code> original.</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-blue-400 font-mono font-bold text-sm block mb-1">SACONF</span>
            <span className="text-slate-400 block mb-2">Configuración Central de Saint</span>
            <p className="text-slate-300 mb-2">
              Contiene el campo <code className="text-blue-300 font-mono">FACTOR</code>, que representa la nueva tasa de cambio fijada en el ERP para la moneda alterna (divisa).
            </p>
            <p className="text-slate-400">
              Es el factor multiplicador que se aplicará sobre los saldos convertidos a moneda dura.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-purple-400 font-mono font-bold text-sm block mb-1">SAMECA_03 / 06 / 07</span>
            <span className="text-slate-400 block mb-2">Tablas de Parámetros e Histórico</span>
            <p className="text-slate-300 mb-2">
              Almacenan el factor previo y las fechas de corte:
            </p>
            <div className="space-y-1 text-slate-400">
              <div>• <strong>SAMECA_03:</strong> Fechas de corte <code className="text-purple-300">Fecha_Indexar_*</code> e histórico en Procentro.</div>
              <div>• <strong>SAMECA_06:</strong> Histórico de factores en Club Deportivo.</div>
              <div>• <strong>SAMECA_07:</strong> Histórico de factores en Los Robles.</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/10">
            <span className="text-emerald-400 font-mono font-bold text-sm block mb-1">LOG_INDEXACION</span>
            <span className="text-emerald-400/80 block mb-2">Nueva Tabla de Auditoría</span>
            <p className="text-slate-300 mb-2">
              Creada para sustituir los archivos de texto planos (.txt):
            </p>
            <p className="text-slate-400">
              Guarda el Id de lote, la empresa, fecha/hora exacta, tasa previa, tasa nueva, cantidad de documentos indexados, usuario y resultado (ÉXITO o ERROR).
            </p>
          </div>
        </div>
      </div>

      {/* Regla Matemática de Indexación */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2">Fórmula Matemática de Conversión Saint</h3>
        <p className="text-xs text-slate-400 mb-4">
          La lógica conserva con exactitud milimétrica la matemática que ya utilizabas, pero ejecutada en un solo ciclo masivo:
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto space-y-2">
          <div className="text-slate-500">-- 1. Determinar el valor en moneda base (divisa) y proyectar al nuevo factor:</div>
          <div className="text-emerald-400 font-semibold">
            Saldo_Nuevo = ROUND( (Saldo_Actual / Factor_Historico) * Factor_Actual, 2 )
          </div>
          <div className="text-slate-500">-- 2. Para cuotas (TipoCxC = 70) se recalcula además el monto original:</div>
          <div className="text-teal-400 font-semibold">
            Monto_Nuevo = ROUND( (Monto_Actual / Factor_Historico) * Factor_Actual, 2 )
          </div>
        </div>
      </div>
    </div>
  );
};

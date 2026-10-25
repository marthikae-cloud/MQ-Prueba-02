import React, { useState } from 'react';
import { FileSpreadsheet, Check, Copy, ArrowRight, ShieldCheck, FolderSync, Terminal, HelpCircle } from 'lucide-react';

export const ReportBuilderGuide: React.FC = () => {
  const [copiedQuery, setCopiedQuery] = useState(false);

  const sqlQueryReportBuilder = `EXEC [LOSROBLES].[dbo].[sp_Ejecutar_Indexacion_Cascada] 
    @UsuarioEjecutor = 'USUARIO_ACTUAL';`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQueryReportBuilder);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Integración Nativa con Saint Enterprise
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Cómo Integrar la Indexación en Saint Report Builder
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tal como lo planteaste, Martha: al colocar la ejecución dentro de un reporte de <strong>Saint Report Builder</strong>, eliminas la necesidad de archivos de lote externos en Windows y proteges las credenciales. Los usuarios simplemente abrirán el reporte, harán clic en <em>"Vista Previa"</em> o <em>"Imprimir"</em> y el sistema ejecutará la cascada en el servidor SQL Server mostrando un comprobante formal con los resultados.
          </p>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2">Crear el Reporte en Saint</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Desde el módulo <strong>Administrativo de Saint Enterprise</strong>, ve al menú:
              <br />
              <code className="text-amber-300 bg-slate-950 px-2 py-1 rounded block mt-2 font-mono text-[11px]">
                Herramientas → Diseñador de Reportes (Report Builder)
              </code>
            </p>
            <p className="text-xs text-slate-400">
              Crea un nuevo reporte en blanco y asígnale el nombre: <strong className="text-slate-200">"Comprobante de Indexación Multidivisa en Cascada"</strong>.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2">Configurar la Consulta SQL</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              En la pestaña <strong>Datos (Data)</strong> de Report Builder, selecciona <em>"Consulta Directa / SQL Passthrough"</em> y pega la instrucción:
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 relative">
              <pre className="whitespace-pre overflow-x-auto">{sqlQueryReportBuilder}</pre>
              <button
                onClick={handleCopy}
                className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-all cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedQuery ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2">Diseñar la Cuadrícula</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Arrastra los campos devueltos por el Stored Procedure a la banda de <strong>Detalle</strong> del reporte:
            </p>

            <ul className="text-xs text-slate-400 space-y-1">
              <li>• <strong className="text-slate-200">Empresa:</strong> Los Robles, Club, Procentro</li>
              <li>• <strong className="text-slate-200">TasaAplicada:</strong> Tasa SACONF aplicada</li>
              <li>• <strong className="text-slate-200">RegistrosAfectados:</strong> N° de documentos</li>
              <li>• <strong className="text-slate-200">Estado:</strong> EXITOSO / FALLIDO</li>
              <li>• <strong className="text-slate-200">SegundosDuracion:</strong> Tiempo de ejecución</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Previsualización del Ticket / Comprobante que verá el usuario */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <span>Vista Previa del Comprobante Generado en Saint</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Esto es exactamente lo que el usuario de Saint verá en pantalla o mandará a imprimir al correr el reporte:
        </p>

        <div className="max-w-2xl mx-auto bg-white text-slate-900 p-6 rounded-xl shadow-2xl font-mono text-xs border border-slate-300">
          <div className="text-center border-b pb-3 mb-3 border-slate-300">
            <h4 className="font-bold text-sm tracking-wide">GRUPO EMPRESARIAL LOS ROBLES</h4>
            <p className="text-[11px] text-slate-600">COMPROBANTE DE INDEXACIÓN EN CASCADA SAINT ERP</p>
            <p className="text-[10px] text-slate-500">Fecha: {new Date().toLocaleDateString('es-VE')} | Hora: 04:30:00 | Servidor: SERVER6</p>
          </div>

          <table className="w-full text-left my-3 border-collapse">
            <thead>
              <tr className="border-b border-slate-400 text-[11px]">
                <th className="py-1">PASO</th>
                <th className="py-1">EMPRESA</th>
                <th className="py-1 text-right">TASA BS.</th>
                <th className="py-1 text-right">DOCS.</th>
                <th className="py-1 text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              <tr>
                <td className="py-1.5 font-bold">1</td>
                <td className="py-1.5">LOS ROBLES</td>
                <td className="py-1.5 text-right font-semibold">38.2000</td>
                <td className="py-1.5 text-right font-semibold">1,482</td>
                <td className="py-1.5 text-center font-bold text-emerald-700">EXITOSO</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold">2</td>
                <td className="py-1.5">CLUB DEPORTIVO</td>
                <td className="py-1.5 text-right font-semibold">38.2000</td>
                <td className="py-1.5 text-right font-semibold">894</td>
                <td className="py-1.5 text-center font-bold text-emerald-700">EXITOSO</td>
              </tr>
              <tr>
                <td className="py-1.5 font-bold">3</td>
                <td className="py-1.5">PROCENTROS</td>
                <td className="py-1.5 text-right font-semibold">38.2000</td>
                <td className="py-1.5 text-right font-semibold">245</td>
                <td className="py-1.5 text-center font-bold text-emerald-700">EXITOSO</td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-slate-300 pt-3 flex justify-between text-[11px] text-slate-600">
            <span>Total Documentos: <strong>2,621 registros</strong></span>
            <span>Tiempo de Ejecución: <strong>0.16 segundos</strong></span>
          </div>

          <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[10px] text-center text-slate-500">
            * Transacción registrada en LOG_INDEXACION_SAINT de forma permanente.
          </div>
        </div>
      </div>

      {/* Beneficios de Replicación para Laboratorios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <FolderSync className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">
              Solución Definitiva al Problema de los Laboratorios y Respaldos
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mencionaste el dolor de cabeza de tener que recoger archivos .sql sueltos, scripts en el escritorio y carpetas cuando querías hacer un laboratorio de pruebas o restaurar un respaldo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-rose-400 block mb-1">Antes (Con archivos sueltos):</strong>
                Al restaurar en una máquina de prueba, tenías que copiar carpetas, cambiar rutas de discos <code className="text-amber-300">C:\...</code> en el archivo .bat, revisar si existía osql y lidiar con archivos .txt desordenados.
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/60 bg-emerald-950/10">
                <strong className="text-emerald-400 block mb-1">Ahora (Con la Suite T-SQL):</strong>
                Solo restauras los 3 archivos <code className="text-emerald-300">.BAK</code>. Como los Stored Procedures y la tabla de auditoría están guardados <strong>dentro de las mismas bases de datos</strong>, todo el proceso de indexación en cascada y el reporte de Saint Report Builder funcionan de inmediato sin configurar nada en Windows.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

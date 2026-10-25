import React, { useState } from 'react';
import { SQL_SCRIPTS, SqlScript } from '../data/tsqlScripts';
import { Copy, Check, Terminal, FileCode, Layers, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export const ScriptsRepository: React.FC = () => {
  const [selectedScriptId, setSelectedScriptId] = useState<string>('consulta_diagnostico');
  const [copied, setCopied] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const selectedScript = SQL_SCRIPTS.find(s => s.id === selectedScriptId) || SQL_SCRIPTS[0];

  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadScript = (script: SqlScript) => {
    const element = document.createElement('a');
    const file = new Blob([script.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${script.id.toUpperCase()}_SAINT.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadAll = () => {
    const combined = SQL_SCRIPTS.map(s => (
      `-- ==========================================================================\n` +
      `-- SCRIPT: ${s.title} (BD: ${s.database})\n` +
      `-- ==========================================================================\n\n` +
      s.code + `\n\nGO\n\n`
    )).join('\n');

    const element = document.createElement('a');
    const file = new Blob([combined], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SUITE_COMPLETA_INDEXACION_SAINT_CASCADA.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredScripts = filterCategory === 'all' 
    ? SQL_SCRIPTS 
    : SQL_SCRIPTS.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Repositorio de Scripts T-SQL Optimizados</h2>
            <p className="text-xs text-slate-400">
              Códigos listos para compilar en SQL Server Management Studio (SSMS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Descargar todos los scripts en un solo archivo .SQL"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Descargar Suite Completa (.sql)
          </button>
        </div>
      </div>

      {/* Main Grid: Scripts list and Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scripts selector list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'migracion', label: 'Post-Migración 9750' },
              { id: 'orquestador', label: 'Orquestador' },
              { id: 'empresa', label: 'Empresas' },
              { id: 'auditoria', label: 'Auditoría' },
              { id: 'report_builder', label: 'Report Builder' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  filterCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredScripts.map((script) => {
              const isSelected = script.id === selectedScript.id;
              return (
                <button
                  key={script.id}
                  onClick={() => {
                    setSelectedScriptId(script.id);
                    setCopied(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      USE [{script.database}]
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {script.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1 leading-snug">
                    {script.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {script.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Script Code Viewer & Explanation */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Header of code block */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">{selectedScript.title}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  Base de datos: <strong className="text-emerald-300">{selectedScript.database}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadScript(selectedScript)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  title="Descargar archivo .sql"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar .sql
                </button>
                <button
                  onClick={() => handleCopy(selectedScript.code)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white" />
                      <span>Copiar T-SQL</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative bg-slate-950 p-4 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre">{selectedScript.code}</pre>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Lógica de Ejecución (Explicación DBA)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedScript.explanation.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Mejoras Frente a los Scripts .BAT
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedScript.improvements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">Tablas Saint involucradas: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedScript.saintTables.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

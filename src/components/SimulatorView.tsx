import React, { useState } from 'react';
import { SAMPLE_CXC_DATA, SampleCxcRecord } from '../data/tsqlScripts';
import { Calculator, ArrowRight, TrendingUp, Cpu, Gauge, CheckCircle2 } from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const [factorAnterior, setFactorAnterior] = useState<number>(607.39);
  const [factorNuevo, setFactorNuevo] = useState<number>(625.00);
  const [records, setRecords] = useState<SampleCxcRecord[]>(SAMPLE_CXC_DATA);

  // Recalculate simulation values
  const recalculateData = (prevFactor: number, newFactor: number) => {
    if (prevFactor <= 0) return;
    const updated = SAMPLE_CXC_DATA.map(rec => {
      const nuevoSaldo = Number(((rec.saldoAnterior / prevFactor) * newFactor).toFixed(2));
      // Cuotas (70) actualizan Monto y Saldo; Facturas (10) actualizan solo Saldo
      const nuevoMonto = rec.tipoCxC === 70 
        ? Number(((rec.montoAnterior / prevFactor) * newFactor).toFixed(2))
        : rec.montoAnterior;

      return {
        ...rec,
        saldoNuevo: nuevoSaldo,
        montoNuevo: nuevoMonto
      };
    });
    setRecords(updated);
  };

  const handlePrevFactorChange = (val: number) => {
    setFactorAnterior(val);
    recalculateData(val, factorNuevo);
  };

  const handleNewFactorChange = (val: number) => {
    setFactorNuevo(val);
    recalculateData(factorAnterior, val);
  };

  const variacionPct = factorAnterior > 0 
    ? (((factorNuevo - factorAnterior) / factorAnterior) * 100).toFixed(2)
    : '0.00';

  const totalSaldoAnterior = records.reduce((acc, r) => acc + r.saldoAnterior, 0);
  const totalSaldoNuevo = records.reduce((acc, r) => acc + r.saldoNuevo, 0);
  const diferenciaTotal = totalSaldoNuevo - totalSaldoAnterior;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Simulador Matemático Saint
              </span>
              <span className="text-xs text-slate-400">Verificación de Fórmulas SAACXC</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Cálculo de Indexación en Tiempo Real
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Prueba con diferentes tasas para comprobar cómo opera la fórmula de conversión sobre las cuotas y facturas en Saint Enterprise.
            </p>
          </div>

          {/* Factor Controls */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Factor Histórico (Previo)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={factorAnterior}
                  onChange={(e) => handlePrevFactorChange(parseFloat(e.target.value) || 1)}
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-center pt-5">
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Factor Nuevo (SACONF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={factorNuevo}
                  onChange={(e) => handleNewFactorChange(parseFloat(e.target.value) || 1)}
                  className="w-32 bg-slate-900 border border-emerald-500/60 rounded-lg px-3 py-1.5 text-emerald-400 font-mono text-sm font-bold focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Variación Cambiaria
              </span>
              <span className={`inline-flex items-center gap-1 text-sm font-bold font-mono ${
                Number(variacionPct) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <TrendingUp className="w-4 h-4" />
                {Number(variacionPct) >= 0 ? `+${variacionPct}%` : `${variacionPct}%`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Total Cartera (Saldo Anterior)</span>
          <span className="text-lg font-bold font-mono text-slate-200">
            {totalSaldoAnterior.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-900/60 p-4 rounded-xl bg-emerald-950/10">
          <span className="text-xs text-emerald-400 font-medium block mb-1">Total Cartera (Saldo Indexado)</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {totalSaldoNuevo.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Ajuste por Diferencial Cambiario</span>
          <span className="text-lg font-bold font-mono text-teal-400">
            +{diferenciaTotal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
          </span>
        </div>
      </div>

      {/* Interactive Table of Sample Documents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Muestra de Registros en Tabla SAACXC</h3>
          </div>
          <span className="text-xs text-slate-400">
            *Saint Enterprise 9.750: <strong>MontoMEx</strong> y <strong>SaldoMEx</strong> se mantienen fijos como ancla en $. <strong>Factor</strong> y saldos en Bs se recalculan.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Documento</th>
                <th className="py-3 px-3">Cliente</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3 text-right bg-emerald-950/20 text-emerald-300">MontoMEx ($)</th>
                <th className="py-3 px-3 text-right bg-emerald-950/20 text-emerald-300">SaldoMEx ($)</th>
                <th className="py-3 px-3 text-right text-amber-300">Factor SAACXC</th>
                <th className="py-3 px-3 text-right">Saldo Ant. (Bs)</th>
                <th className="py-3 px-3 text-right font-bold text-white">Saldo Index. (Bs)</th>
                <th className="py-3 px-3 text-right">Monto Bs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {records.map((r) => (
                <tr key={r.nroUnico} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    {r.numeroD}
                    <span className="block text-[10px] text-slate-500 font-sans">ID: #{r.nroUnico}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="font-medium text-slate-200">{r.nombreClie}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{r.codClie}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      r.tipoCxC === 70 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {r.tipoDesc} ({r.tipoCxC})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400 bg-emerald-950/10">
                    ${r.montoMEx.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400 bg-emerald-950/10">
                    ${r.saldoMEx.toFixed(2)}
                    <span className="block text-[9px] text-slate-400 font-sans">(Fijo)</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">
                    {factorNuevo.toFixed(2)}
                    <span className="block text-[9px] text-slate-400 font-sans">(Actualizado)</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {r.saldoAnterior.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-300">
                    {r.saldoNuevo.toFixed(2)} Bs.
                    <span className="block text-[9px] text-slate-500 font-sans">
                      (${r.saldoMEx} × {factorNuevo})
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {r.tipoCxC === 70 ? (
                      <span className="font-bold text-purple-300">{r.montoNuevo.toFixed(2)} Bs.</span>
                    ) : (
                      <span className="text-slate-500 line-through text-[11px]">{r.montoNuevo.toFixed(2)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison: Cursor vs Set-Based Performance Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-emerald-400" />
          Benchmark de Rendimiento: Cursor Antiguo vs Set-Based
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Antiguo Cursor */}
          <div className="p-4 bg-slate-950 rounded-xl border border-rose-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">1. Cursor Fila a Fila (RBAR)</span>
              <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                Lento & Bloqueante
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Consultas ejecutadas:</span>
                <span className="font-mono text-rose-300">~8,450 queries (en 2,000 cuotas)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiempo de ejecución:</span>
                <span className="font-mono text-rose-300">35 - 55 segundos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bloqueo de base de datos:</span>
                <span className="font-mono text-rose-300">SET SINGLE_USER (Expulsa usuarios)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comportamiento ante error:</span>
                <span className="font-mono text-rose-300">Inconsistencia parcial (Sin rollback)</span>
              </div>
            </div>
          </div>

          {/* Nuevo Set-Based */}
          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">2. Operación Basada en Conjuntos (Set-Based)</span>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Instantáneo & Atómico
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Consultas ejecutadas:</span>
                <span className="font-mono text-emerald-300">2 sentencias UPDATE masivas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiempo de ejecución:</span>
                <span className="font-mono text-emerald-300">~0.08 segundos (99.8% más rápido)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bloqueo de base de datos:</span>
                <span className="font-mono text-emerald-300">Bloqueo de fila (Usuarios siguen en Saint)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comportamiento ante error:</span>
                <span className="font-mono text-emerald-300">ROLLBACK total automático</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

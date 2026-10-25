import React, { useState } from 'react';
import { ArrowDown, CheckCircle2, ShieldAlert, AlertTriangle, Layers, Play, Clock, Sparkles } from 'lucide-react';

export const CascadeFlowDiagram: React.FC = () => {
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed' | 'error_demo'>('idle');
  const [activeStep, setActiveStep] = useState<number>(0);

  const runSimulation = (simulateError: boolean = false) => {
    setSimulationState('running');
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        if (simulateError) {
          setSimulationState('error_demo');
          setActiveStep(2.5); // Error on Club Deportivo
        } else {
          setActiveStep(3);
          setTimeout(() => {
            setActiveStep(4);
            setSimulationState('completed');
          }, 900);
        }
      }, 900);
    }, 900);
  };

  const resetSimulation = () => {
    setSimulationState('idle');
    setActiveStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Secuencia en Cascada Solicitada
              </span>
              <span className="text-xs text-slate-400 font-mono">SERVER6 (Local Instance)</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Orquestación: Los Robles → Club Deportivo → Procentro
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Al ejecutar la indexación desde la base de datos principal <strong>LOS ROBLES</strong>, el procedimiento maestro <code className="text-emerald-400 font-mono font-bold">sp_Ejecutar_Indexacion_Cascada</code> invoca secuencialmente a cada empresa, validando factores y registrando métricas en la bitácora.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {simulationState === 'idle' ? (
              <>
                <button
                  onClick={() => runSimulation(false)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Simular Flujo Exitoso
                </button>
                <button
                  onClick={() => runSimulation(true)}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  title="Demostrar qué sucede si ocurre un error a mitad de camino"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Simular Falla y Rollback
                </button>
              </>
            ) : (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                Reiniciar Simulación
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Flow */}
      <div className="relative space-y-4">
        {/* Step 1: Los Robles */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          activeStep === 1
            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
            : activeStep > 1
            ? 'bg-slate-900/90 border-emerald-900/60'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                activeStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">LOS ROBLES (Base de Datos Host & Master)</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    USE [LOSROBLES]
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Ejecuta <code className="text-emerald-400">sp_Indexar_LosRobles</code>:
                  actualiza Cuotas (TipoCxC=70 Saldo y Monto), Facturas (TipoCxC=10 Saldo) y registra nuevo factor en <code className="text-purple-300">SAMECA_07</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {activeStep === 1 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Procesando Set-based...
                </span>
              )}
              {activeStep > 1 && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completado (0.07 seg)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cascade Connector */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Step 2: Club Deportivo */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          activeStep === 2
            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
            : activeStep === 2.5
            ? 'bg-rose-950/40 border-rose-600 ring-2 ring-rose-500/30'
            : activeStep > 2
            ? 'bg-slate-900/90 border-emerald-900/60'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                activeStep === 2.5
                  ? 'bg-rose-600 text-white'
                  : activeStep >= 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">CLUB DEPORTIVO (Segundo en Cascada)</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    USE [CLUBDEPORTIVO]
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Invocado automáticamente mediante llamada interbase <code className="text-blue-400">[CLUBDEPORTIVO].[dbo].[sp_Indexar_ClubDeportivo]</code>.
                  Indexa cuotas y facturas en SAACXC e inserta en <code className="text-purple-300">SAMECA_06</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {activeStep === 2 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Procesando Club Deportivo...
                </span>
              )}
              {activeStep === 2.5 && (
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-4 h-4" /> Transacción Abortada (Rollback Seguro)
                </span>
              )}
              {activeStep > 2 && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completado (0.05 seg)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cascade Connector */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Step 3: Procentros */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          activeStep === 3
            ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
            : activeStep === 2.5
            ? 'bg-slate-900/30 border-slate-800 opacity-50'
            : activeStep > 3
            ? 'bg-slate-900/90 border-emerald-900/60'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                activeStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">PROCENTROS (Fase Final de la Cascada)</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                    USE [PROCENTROS]
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Invocado mediante <code className="text-purple-400">[PROCENTROS].[dbo].[sp_Indexar_Procentros]</code>.
                  Lee <code className="text-amber-300">Fecha_Indexar_Facturas</code> desde <code className="text-slate-300">[LOSROBLES].[dbo].[SAMECA_03]</code> y actualiza Facturas (TipoCxC=10) y su histórico <code className="text-purple-300">SAMECA_03</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {activeStep === 3 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> Procesando Procentro...
                </span>
              )}
              {activeStep > 3 && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completado (0.04 seg)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cascade Connector */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-400">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Step 4: Auditoría y Salida a Report Builder */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          activeStep === 4
            ? 'bg-emerald-950/20 border-emerald-500/80 shadow-xl'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                activeStep === 4 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                4
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Retorno de Dataset & Bitácora en LOG_INDEXACION_SAINT</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Saint Report Builder Ready
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  El procedimiento devuelve una tabla estructurada con el resultado de las 3 fases para que Saint Report Builder pinte el comprobante en pantalla o impresora.
                </p>
              </div>
            </div>

            {activeStep === 4 && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                ¡Cascada Completa Exitosa!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Explicación de Integridad Referencial y Manejo de Errores */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          ¿Por qué este diseño es superior para respaldos y laboratorios?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 mt-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-emerald-400 block mb-1">1. Autocontenido en la BD</strong>
            <p className="text-slate-400">
              Al sacar un respaldo <code className="text-slate-200">.BAK</code> de LOSROBLES, los procedimientos almacenados, tablas históricas y de auditoría viajan dentro del archivo. No hay que buscar archivos .sql perdidos.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-blue-400 block mb-1">2. Sin Dependencias del S.O.</strong>
            <p className="text-slate-400">
              No depende de que Windows tenga la ruta <code className="text-slate-200">C:\Scripts</code> creada, ni de versiones de <code className="text-slate-200">osql.exe</code> ni de permisos de carpetas compartidas.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-purple-400 block mb-1">3. Seguridad de Acceso</strong>
            <p className="text-slate-400">
              El usuario que corre Saint Report Builder solo necesita permisos de ejecución <code className="text-slate-200">EXECUTE</code> sobre el procedimiento, sin conocer la contraseña del administrador <code className="text-slate-200">sa</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

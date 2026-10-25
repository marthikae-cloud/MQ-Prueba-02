import React from 'react';
import { Database, ShieldCheck, Server, Layers, Cpu, Smartphone } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenInstallModal }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Consultoría DBA Saint ERP
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  T-SQL Experto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Arquitectura de Indexación en Cascada: <span className="text-slate-200 font-medium">Los Robles → Club Deportivo → Procentro</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-lg shadow-md shadow-emerald-950/30 transition-all cursor-pointer border border-emerald-400/30"
              title="Descargar e instalar en tablet o celular"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalar en Móvil / Tablet</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg text-slate-300 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Instancia: <strong>SERVER6</strong></span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg text-slate-300 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seguridad: <strong>Sin claves en texto plano</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto">
          {[
            { id: 'diagnosis', label: 'Diagnóstico & Arquitectura', icon: ShieldCheck },
            { id: 'scripts', label: 'Scripts T-SQL Optimizados', icon: Database },
            { id: 'cascade', label: 'Flujo en Cascada', icon: Layers },
            { id: 'simulator', label: 'Simulador de Indexación', icon: Cpu },
            { id: 'report-builder', label: 'Guía Saint Report Builder', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DiagnosisView } from './components/DiagnosisView';
import { ScriptsRepository } from './components/ScriptsRepository';
import { CascadeFlowDiagram } from './components/CascadeFlowDiagram';
import { SimulatorView } from './components/SimulatorView';
import { ReportBuilderGuide } from './components/ReportBuilderGuide';
import { InstallModal } from './components/InstallModal';
import { Database, Smartphone } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('diagnosis');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Mobile/Tablet Callout Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-emerald-900/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>¿Usas Tablet o Teléfono?</strong> Esta aplicación es compatible como PWA: puedes guardarla en tu pantalla de inicio y usarla sin navegador.
            </span>
          </div>
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold text-[11px] shrink-0 transition-all cursor-pointer"
          >
            Ver QR / Instalar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'diagnosis' && (
          <DiagnosisView 
            onGoToScripts={() => setActiveTab('scripts')}
            onGoToCascade={() => setActiveTab('cascade')}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptsRepository />
        )}

        {activeTab === 'cascade' && (
          <CascadeFlowDiagram />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView />
        )}

        {activeTab === 'report-builder' && (
          <ReportBuilderGuide />
        )}
      </main>

      {/* Modal for Tablet / Mobile Installation */}
      <InstallModal 
        isOpen={isInstallModalOpen} 
        onClose={() => setIsInstallModalOpen(false)} 
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-3.5 h-3.5" />
            </div>
            <span>
              Arquitectura T-SQL para Saint Enterprise ERP | Consultoría DBA para Martha
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Microsoft SQL Server (2012 - 2022+)</span>
            <span>•</span>
            <span>PWA Instalable en Móvil & Tablet</span>
            <span>•</span>
            <span>Set-Based Operations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Tablet, X, Copy, Check, Download, Share2, PlusSquare, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  // Use the canonical production shared URL or current window location
  const appUrl = typeof window !== 'undefined' 
    ? (window.location.origin.includes('run.app') ? window.location.href : 'https://ais-pre-xbfgia4r5gapdg5nwfx3ia-177424613605.us-west2.run.app')
    : 'https://ais-pre-xbfgia4r5gapdg5nwfx3ia-177424613605.us-west2.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Instalar en Tablet o Teléfono Móvil
              </h3>
              <p className="text-xs text-slate-400">
                Lleva tus scripts y el simulador de Saint en el bolsillo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          {/* Quick Answer Banner */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-300 text-sm mb-1">
                ¡Sí, Martha! Puedes descargarla e instalarla directamente.
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Esta herramienta está configurada como una <strong>Progressive Web App (PWA)</strong>. No necesitas buscar en Google Play ni App Store: se instala directo desde tu navegador web y se guarda como una aplicación nativa con su propio icono en la pantalla de inicio de tu tablet o teléfono, funcionando incluso sin conexión.
              </p>
            </div>
          </div>

          {/* Option 1: Scan QR Code */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
            <div className="p-3 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={appUrl}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Método más rápido (Escanear QR)
              </span>
              <h4 className="font-bold text-white text-sm">
                Apunta la cámara de tu tablet o celular aquí
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Abre la cámara de tu teléfono o tablet, enfoca el código QR y pulsa en el enlace amarillo/azul que aparecerá en tu pantalla para abrir la aplicación al instante.
              </p>
              
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir enlace directo
                </a>
              </div>
            </div>
          </div>

          {/* Direct Install Button if available on Chromium */}
          {isInstallable && (
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 block">Navegador Compatible Detectado</span>
                <p className="text-xs text-slate-300">Puedes instalar la app en este dispositivo con un solo clic.</p>
              </div>
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-700/40 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                Instalar Ahora
              </button>
            </div>
          )}

          {/* Step-by-Step Instructions Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-slate-800 pb-2 gap-3 text-xs font-semibold">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`flex items-center gap-2 pb-1 transition-all cursor-pointer ${
                  activeDeviceTab === 'android'
                    ? 'text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Android / Tablet / Chrome
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex items-center gap-2 pb-1 transition-all cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                iPhone / iPad (Safari)
              </button>
            </div>

            {activeDeviceTab === 'android' ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Abre el enlace en Google Chrome o Microsoft Edge en tu teléfono o tablet.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Toca los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha del navegador.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                  <span>¡Listo! Se creará un acceso directo con el icono de <strong>SaintDBA</strong> en el menú de aplicaciones de tu móvil.</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Abre el enlace en <strong>Safari</strong> en tu iPhone o iPad.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Toca el botón de <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 text-blue-400 inline" /> (el icono del cuadro con la flecha hacia arriba en la barra inferior).
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    Desliza hacia abajo y presiona <strong>"Agregar al inicio"</strong> <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> (Add to Home Screen).
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                  <span>Pulsa <strong>"Agregar"</strong> en la esquina superior derecha. Se abrirá a pantalla completa sin la barra del navegador.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Icono de acceso: <strong>SaintDBA</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-all cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { LayerType, EnhancementSettings } from '../types';
import Icon from './Icon';

interface EnhancementPanelProps {
  image: string;
  layerType: LayerType;
  onEnhance: (settings: EnhancementSettings) => void;
  onClose: () => void;
  isEnhancing: boolean;
}

const EnhancementPanel: React.FC<EnhancementPanelProps> = ({
  image,
  layerType,
  onEnhance,
  onClose,
  isEnhancing,
}) => {
  const [model, setModel] = useState("Classic");
  const [resolution, setResolution] = useState("2k");
  const [style, setStyle] = useState("Estándar");
  const [creativity, setCreativity] = useState("Nada");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnhance({ model, resolution, style, creativity, prompt });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
      <div 
        className="bg-[#111] text-white rounded-2xl p-4 w-full max-w-sm shadow-xl border border-neutral-800"
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold capitalize text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Enhance {layerType}</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="close" className="w-6 h-6" />
            </button>
        </div>
        
        {/* Image Preview */}
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4 bg-neutral-900 flex items-center justify-center border border-neutral-700">
            <img src={image} alt={`Preview of ${layerType}`} className="object-contain h-full w-full" />
        </div>

        {/* MODEL */}
        <div className="mb-3">
            <label className="text-sm text-gray-300 block mb-1">MODEL</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-neutral-800 border-none p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option>Classic</option>
                <option>Cinematic</option>
                <option>Realista</option>
                <option>Vector</option>
            </select>
        </div>

        {/* RESOLUTION + STYLE */}
        <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
                <label className="text-sm text-gray-300 block mb-1">RESOLUTION</label>
                <div className="flex gap-2 text-sm">
                    {["2k", "4k"].map((r) => (
                        <button key={r} onClick={() => setResolution(r)} className={`px-3 py-1 rounded-lg w-full ${resolution === r ? "bg-blue-600" : "bg-neutral-800"}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-sm text-gray-300 block mb-1">IMAGE STYLE</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-neutral-800 border-none p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <option>Estándar</option>
                    <option>Artístico</option>
                    <option>Cómic</option>
                    <option>Fotorrealista</option>
                </select>
            </div>
        </div>

        {/* CREATIVITY */}
        <div className="mb-3">
            <label className="text-sm text-gray-300 block mb-1">CREATIVITY</label>
            <div className="flex gap-1 text-xs">
                {["Nada", "Bajo", "Medio", "Alto", "Libre"].map((lvl) => (
                    <button key={lvl} onClick={() => setCreativity(lvl)} className={`px-2 py-1 rounded-lg flex-1 ${creativity === lvl ? "bg-blue-600" : "bg-neutral-800"}`}>
                        {lvl}
                    </button>
                ))}
            </div>
        </div>

        {/* PROMPT */}
        <div className="mb-4">
            <label className="text-sm text-gray-300 block mb-1">PROMPT</label>
            <input
                placeholder="Describe changes for better results"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-neutral-800 border-none text-white placeholder-gray-500 p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                disabled={isEnhancing}
            />
        </div>

        {/* BUTTON */}
        <button
            onClick={handleSubmit}
            disabled={isEnhancing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 py-2 rounded-xl font-semibold disabled:bg-blue-800/50 disabled:cursor-not-allowed"
        >
           {isEnhancing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                Enhancing...
              </>
            ) : (
                <>
                    <Icon name="sparkles" className="w-4 h-4" />
                    Enhance
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default EnhancementPanel;
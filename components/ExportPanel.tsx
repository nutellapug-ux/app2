import React, { useState } from 'react';
import { ExportSettings } from '../types';
import Icon from './Icon';

interface ExportPanelProps {
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
  onCreateNew: () => void;
  isLoading: string | null;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onClose, onExport, onCreateNew, isLoading }) => {
  const [format, setFormat] = useState<ExportSettings['format']>('webp');
  const [resolution, setResolution] = useState<ExportSettings['resolution']>('4k');
  const [background, setBackground] = useState<ExportSettings['background']>('transparent');
  const [customColor, setCustomColor] = useState('#ffffff');

  const handleExport = () => {
    onExport({ format, resolution, background, customColor });
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-2xl text-white rounded-3xl p-5 shadow-xl w-full max-w-md mx-auto space-y-5 border border-white/10">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-200">
                Export Flyer
            </h2>
            <button onClick={onClose} disabled={!!isLoading} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
                <Icon name="close" className="w-7 h-7" />
            </button>
        </div>

        {/* Format Selector */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-gray-400">Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as ExportSettings['format'])} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white">
                <option value="webp">WebP (recommended, transparent)</option>
                <option value="tiff">TIFF (professional printing)</option>
                <option value="png">PNG (universal compatibility)</option>
            </select>
        </div>

        {/* Resolution Selector */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-gray-400">Resolution</label>
            <select value={resolution} onChange={(e) => setResolution(e.target.value as ExportSettings['resolution'])} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white">
                <option value="1080p">HD 1080p</option>
                <option value="4k">4K Ultra HD</option>
                <option value="8k">8K Max Quality</option>
            </select>
        </div>

        {/* Background Selector */}
        <div>
            <label className="block text-sm font-semibold mb-2 text-gray-400">Background</label>
             <div className="flex gap-2">
                <select value={background} onChange={(e) => setBackground(e.target.value as ExportSettings['background'])} className="flex-grow bg-white/5 border border-white/10 rounded-lg p-2.5 text-white">
                    <option value="transparent">Transparent</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="custom">Custom Color</option>
                </select>
                {background === 'custom' && (
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-auto p-0 border-none rounded-lg cursor-pointer bg-transparent"
                  />
                )}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-3">
            <button
                onClick={handleExport}
                disabled={!!isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl py-3 text-lg font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    {isLoading}
                  </>
                ) : 'Download Image'}
            </button>

            <button
                onClick={onCreateNew}
                disabled={!!isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 text-lg font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Icon name="sparkles" className="w-5 h-5"/>
                Create New Image
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
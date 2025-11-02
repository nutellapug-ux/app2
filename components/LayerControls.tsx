import React from 'react';
import { Layers, VisibleLayers, LayerType } from '../types';
import Icon from './Icon';
import { dataUrlToBlob } from '../utils/imageUtils';

interface LayerControlsProps {
  layers: Layers;
  visibleLayers: VisibleLayers;
  onToggleVisibility: (layer: LayerType) => void;
  isExporting: boolean;
  onExport: () => void;
}

const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  visibleLayers,
  onToggleVisibility,
  isExporting,
  onExport,
}) => {
  const handleDownload = async (layerType: LayerType) => {
    const dataUrl = layers[layerType];
    if (!dataUrl) return;

    try {
      const blob = await dataUrlToBlob(dataUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layerType}-layer.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download layer:", error);
    }
  };

  const hasLayers = Object.values(layers).some(Boolean);

  return (
    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/10 mt-6 lg:mt-0">
      <h3 className="text-lg font-medium mb-4 text-gray-300">Layers</h3>
      <div className="space-y-3">
        {Object.values(LayerType).map((layerType) => (
          <div
            key={layerType}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${layers[layerType] ? 'bg-white/5' : 'bg-red-500/10 opacity-50'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-400 capitalize">{layerType}</span>
            </div>
            {layers[layerType] ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(layerType)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title={`Download ${layerType} layer`}
                >
                  <Icon name="download" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onToggleVisibility(layerType)}
                  className={`p-2 rounded-full transition-colors ${visibleLayers[layerType] ? 'text-sky-400 hover:bg-sky-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/10'}`}
                  title={visibleLayers[layerType] ? 'Hide layer' : 'Show layer'}
                >
                  <Icon name={visibleLayers[layerType] ? 'eye' : 'eye-off'} className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <span className="text-xs font-semibold text-red-400/80">Not available</span>
            )}
          </div>
        ))}
      </div>
       {hasLayers && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <button
              onClick={onExport}
              disabled={isExporting}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-300 disabled:bg-sky-500/40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               Export Final Image
            </button>
          </div>
       )}
    </div>
  );
};

export default LayerControls;
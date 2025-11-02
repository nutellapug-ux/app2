import React from 'react';
import { Layers, VisibleLayers, LoadingState, LayerType } from '../types';
import Icon from './Icon';

interface PreviewerProps {
  originalImageUrl: string;
  layers: Layers;
  visibleLayers: VisibleLayers;
  loadingState: LoadingState;
  onRetryLayer: (layer: LayerType) => void;
  onOpenEnhancementPanel: (layer: LayerType) => void;
  onEnhanceQuality: () => void;
  isEnhancingQuality: boolean;
}

const LoadingOverlay: React.FC<{ isLoading: boolean, label: string }> = ({ isLoading, label }) => {
  if (!isLoading) return null;
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-opacity duration-300">
      <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      <span className="mt-3 text-sm text-white/80">{label}...</span>
    </div>
  );
};

const Previewer: React.FC<PreviewerProps> = ({
  originalImageUrl,
  layers,
  visibleLayers,
  loadingState,
  onRetryLayer,
  onOpenEnhancementPanel,
  onEnhanceQuality,
  isEnhancingQuality,
}) => {
  const isAnyLayerLoading = Object.values(loadingState).some(Boolean);
  
  const layerOrder: LayerType[] = [LayerType.BACKGROUND, LayerType.PERSON, LayerType.TEXT];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Original Preview */}
      <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/10">
        <h3 className="text-center text-lg font-medium mb-3 text-gray-300">Original</h3>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl group">
          <img src={originalImageUrl} alt="Original Flyer" className="w-full h-full object-contain" />
           <LoadingOverlay isLoading={isEnhancingQuality} label="Enhancing Quality" />
           {!isEnhancingQuality && (
               <button
                  onClick={onEnhanceQuality}
                  className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-purple-600"
                  title="Enhance image quality before processing"
                >
                  <Icon name="wand" className="w-5 h-5" />
              </button>
           )}
        </div>
      </div>

      {/* AI Reconstructed Preview */}
      <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl shadow-lg border border-white/10">
        <h3 className="text-center text-lg font-medium mb-3 text-gray-300">AI Reconstructed</h3>
        <div className="relative w-full aspect-[3/4] bg-black/20 rounded-2xl overflow-hidden">
           {isAnyLayerLoading && !Object.values(layers).some(Boolean) && (
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="w-10 h-10 border-4 border-white/20 border-t-sky-400 rounded-full animate-spin"></div>
              <span className="mt-4 text-white/90">Analyzing flyer...</span>
            </div>
           )}

          {layerOrder.map(layerType => {
            const isVisible = visibleLayers[layerType];
            const isLoading = loadingState[layerType] ?? false;
            const src = layers[layerType];
            
            return (
              <div
                key={layerType}
                className={`absolute inset-0 transition-opacity duration-500 group ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`${layerType} layer`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                   !isLoading && (
                     <div className="w-full h-full flex items-center justify-center text-center p-4">
                        <div>
                           <p className="text-red-400/80 text-sm font-semibold">Failed to load {layerType}</p>
                           <button 
                              onClick={() => onRetryLayer(layerType)}
                              className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-300 text-xs font-bold rounded-full border border-sky-500/30 hover:bg-sky-500/40 transition-colors"
                            >
                              <Icon name="retry" className="w-3 h-3"/>
                              Retry
                            </button>
                        </div>
                     </div>
                   )
                )}

                {src && !isLoading && !isEnhancingQuality && (
                    <button
                        onClick={() => onOpenEnhancementPanel(layerType)}
                        className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-sky-500"
                        title={`Enhance ${layerType} layer`}
                    >
                        <Icon name="sparkles" className="w-5 h-5" />
                    </button>
                )}
                
                <LoadingOverlay isLoading={isLoading && !isEnhancingQuality} label={loadingState[layerType] ? 'Enhancing...' : `Generating ${layerType}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Previewer;
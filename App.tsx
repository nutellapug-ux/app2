import React, { useState, useCallback, useRef } from 'react';
import UploadArea from './components/UploadArea';
import Previewer from './components/Previewer';
import LayerControls from './components/LayerControls';
import EnhancementPanel from './components/EnhancementPanel';
import ExportPanel from './components/ExportPanel';
import { LayerType, Layers, VisibleLayers, LoadingState, EnhancementSettings, ExportSettings } from './types';
import { separateLayers, createNewImageFromPrompt } from './modules/generator/generatorService';
import { enhanceLayer } from './modules/enhancer/enhancementService';
import { exportImage } from './modules/exporter/exportService';
import { restoreImageQuality } from './modules/cleaner/cleanupService';
import { fileToDataUrl, compositeLayers, downloadDataUrl, dataUrlToBlob } from './utils/imageUtils';

function App() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [layers, setLayers] = useState<Layers>({});
  const [visibleLayers, setVisibleLayers] = useState<VisibleLayers>({
    [LayerType.BACKGROUND]: true,
    [LayerType.PERSON]: true,
    [LayerType.TEXT]: true,
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({});
  const [error, setError] = useState<string | null>(null);
  
  const [isEnhancingQuality, setIsEnhancingQuality] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [exportLoadingMessage, setExportLoadingMessage] = useState<string | null>(null);

  const [enhancementPanel, setEnhancementPanel] = useState<{
    isOpen: boolean;
    layerType: LayerType | null;
    image: string | null;
  }>({ isOpen: false, layerType: null, image: null });
  
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  
  const handleFileUpload = useCallback(async (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError("Invalid file type. Please upload a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 5MB.");
      return;
    }
    setError(null);
    setLayers({});
    setOriginalFile(file);

    const dataUrl = await fileToDataUrl(file);
    setOriginalImageUrl(dataUrl);

    const img = new Image();
    img.onload = () => { originalImageRef.current = img; };
    img.src = dataUrl;

    setLoadingState({
      [LayerType.BACKGROUND]: 'Separating background...',
      [LayerType.PERSON]: 'Separating person...',
      [LayerType.TEXT]: 'Separating text...',
    });

    try {
      const separatedLayers = await separateLayers(file);
      setLayers(separatedLayers);
    } catch (e) {
      console.error(e);
      setError("An error occurred while separating the layers. Please try again.");
    } finally {
      setLoadingState({});
    }
  }, []);
  
  const handleRetryLayer = useCallback(async (layerType: LayerType) => {
    if (!originalFile) return;
    setLoadingState(prev => ({ ...prev, [layerType]: `Re-generating ${layerType}...` }));
    try {
      const separatedLayers = await separateLayers(originalFile);
      setLayers(separatedLayers);
    } catch (e) {
      console.error(e);
      setError(`Failed to retry the ${layerType} layer.`);
    } finally {
      setLoadingState({});
    }
  }, [originalFile]);

  const handleToggleVisibility = (layer: LayerType) => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };
  
  const handleOpenEnhancementPanel = (layerType: LayerType) => {
    if (layers[layerType]) {
      setEnhancementPanel({ isOpen: true, layerType, image: layers[layerType]! });
    }
  };

  const handleCloseEnhancementPanel = () => {
    setEnhancementPanel({ isOpen: false, layerType: null, image: null });
  };
  
  const handleEnhanceLayer = async (settings: EnhancementSettings) => {
    const { layerType, image } = enhancementPanel;
    if (!layerType || !image) return;
    setLoadingState(prev => ({ ...prev, [layerType]: 'Enhancing...' }));
    handleCloseEnhancementPanel();
    try {
      const enhancedImage = await enhanceLayer(image, layerType, settings);
      setLayers(prev => ({ ...prev, [layerType]: enhancedImage }));
    } catch (e) {
      console.error(e);
      setError(`Failed to enhance the ${layerType} layer.`);
    } finally {
       setLoadingState(prev => ({ ...prev, [layerType]: false }));
    }
  };
  
  const handleEnhanceQuality = async () => {
    if (!originalFile) return;
    setIsEnhancingQuality(true);
    try {
      const enhancedImageUrl = await restoreImageQuality(originalFile);
      setOriginalImageUrl(enhancedImageUrl);
      const blob = await dataUrlToBlob(enhancedImageUrl);
      const enhancedFile = new File([blob], originalFile.name, { type: originalFile.type });
      await handleFileUpload(enhancedFile);
    } catch (e) {
       console.error(e);
       setError("Failed to enhance image quality.");
    } finally {
      setIsEnhancingQuality(false);
    }
  };

  const handleExport = async (settings: ExportSettings) => {
    if (!originalImageRef.current) return;
    setExportLoadingMessage('Compositing layers...');
    
    const bgColor = settings.background === 'transparent' ? 'transparent' : 
                    settings.background === 'custom' ? settings.customColor : settings.background;

    const compositeUrl = await compositeLayers(layers, visibleLayers, originalImageRef.current, bgColor);
    
    setExportLoadingMessage('Upscaling with AI...');
    try {
      const finalImageUrl = await exportImage(compositeUrl, settings);
      downloadDataUrl(finalImageUrl, `flyer-rebuilt-${settings.resolution}.${settings.format}`);
      setIsExportPanelOpen(false);
    } catch (e) {
      console.error(e);
      setError("Failed to export image with AI upscaling.");
    } finally {
       setExportLoadingMessage(null);
    }
  };

  const handleCreateNew = async () => {
    const promptText = window.prompt("Describe your new flyer (e.g., 'a concert poster for a rock band, retro style, dark colors').");
    if (!promptText) return;

    setIsExportPanelOpen(false);
    setLayers({});
    setOriginalImageUrl(null);
    setLoadingState({
      [LayerType.BACKGROUND]: 'Creating new flyer...',
      [LayerType.PERSON]: 'Creating new flyer...',
      [LayerType.TEXT]: 'Creating new flyer...',
    });
    
    try {
      const newImageUrl = await createNewImageFromPrompt(promptText);
      const blob = await dataUrlToBlob(newImageUrl);
      const newFile = new File([blob], 'new-flyer.png', { type: 'image/png' });
      await handleFileUpload(newFile);
    } catch (e) {
      console.error(e);
      setError("Failed to create new image from prompt.");
      setLoadingState({});
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
            Flyer Layer Separator AI
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload a flyer, or create a new one, and let AI deconstruct it into editable layers.
          </p>
        </header>

        {!originalImageUrl && !Object.values(loadingState).some(Boolean) ? (
          <UploadArea onUpload={handleFileUpload} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
               <Previewer
                originalImageUrl={originalImageUrl}
                layers={layers}
                visibleLayers={visibleLayers}
                loadingState={loadingState}
                onRetryLayer={handleRetryLayer}
                onOpenEnhancementPanel={handleOpenEnhancementPanel}
                onEnhanceQuality={handleEnhanceQuality}
                isEnhancingQuality={isEnhancingQuality}
              />
            </div>
            <div>
              <LayerControls
                layers={layers}
                visibleLayers={visibleLayers}
                onToggleVisibility={handleToggleVisibility}
                onExport={() => setIsExportPanelOpen(true)}
                isExporting={!!exportLoadingMessage}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-red-500/90 text-white py-2 px-4 rounded-lg shadow-lg z-50">
              {error}
              <button onClick={() => setError(null)} className="ml-4 font-bold">X</button>
          </div>
        )}
        
        {enhancementPanel.isOpen && enhancementPanel.image && enhancementPanel.layerType && (
          <EnhancementPanel
            image={enhancementPanel.image}
            layerType={enhancementPanel.layerType}
            onEnhance={handleEnhanceLayer}
            onClose={handleCloseEnhancementPanel}
            isEnhancing={!!loadingState[enhancementPanel.layerType]}
          />
        )}
        
        {isExportPanelOpen && (
           <ExportPanel 
              onClose={() => setIsExportPanelOpen(false)}
              onExport={handleExport}
              onCreateNew={handleCreateNew}
              isLoading={exportLoadingMessage}
           />
        )}
      </main>
    </div>
  );
}

export default App;
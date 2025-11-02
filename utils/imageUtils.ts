import { Layers, LayerType, VisibleLayers } from "../types";

export const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
};

export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if(typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read file as Data URL."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch data URL: ${res.statusText}`);
  }
  return await res.blob();
};


export const compositeLayers = async (
  layers: Layers,
  visibleLayers: VisibleLayers,
  originalImage: HTMLImageElement,
  backgroundColor: string = 'transparent'
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx || !originalImage) return '';

  const { naturalWidth: width, naturalHeight: height } = originalImage;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  const layerOrder: LayerType[] = [LayerType.BACKGROUND, LayerType.PERSON, LayerType.TEXT];
  const visibleLayerTypes = layerOrder.filter(lt => visibleLayers[lt] && layers[lt]);

  for (const layerType of visibleLayerTypes) {
    const src = layers[layerType];
    if (src) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        });
        ctx.drawImage(img, 0, 0, width, height);
      } catch (error) {
        console.error(`Failed to load image for compositing layer ${layerType}:`, error);
      }
    }
  }

  return canvas.toDataURL('image/png');
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
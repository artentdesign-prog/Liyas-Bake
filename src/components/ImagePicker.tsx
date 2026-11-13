import React, { useRef, useState } from 'react';
import { Check, X, Upload, Sparkles, Link as LinkIcon } from 'lucide-react';
import { PRESET_BAKERY_IMAGES } from '../data/defaultData';

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  label = 'Image',
}) => {
  const [mode, setMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const maxH = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxW) {
            h *= maxW / w;
            w = maxW;
          }
        } else if (h > maxH) {
          w *= maxH / h;
          h = maxH;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          onChange(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          onChange(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-chocolate-900 dark:text-cream-100 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Image Selected
          </span>
        )}
      </div>

      {value && (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-gold-500/40 bg-cream-100 dark:bg-chocolate-950 p-2 flex items-center gap-4 shadow-sm">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-cream-200">
            <img
              src={value}
              alt="Selected Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-chocolate-900 dark:text-cream-50 truncate">
              {value.startsWith('data:')
                ? 'Direct Uploaded Image'
                : 'Image Preview'}
            </p>
            <p className="text-[10px] text-chocolate-600 dark:text-cream-300 truncate">
              {value.startsWith('data:') ? 'Stored locally in session' : value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors mr-2 cursor-pointer"
            title="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 border border-gold-500/20 rounded-xl p-1 bg-cream-100 dark:bg-chocolate-900/50">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'upload'
              ? 'bg-white dark:bg-chocolate-800 text-chocolate-900 dark:text-gold-300 shadow-xs'
              : 'text-chocolate-700 dark:text-cream-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('preset')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'preset'
              ? 'bg-white dark:bg-chocolate-800 text-chocolate-900 dark:text-gold-300 shadow-xs'
              : 'text-chocolate-700 dark:text-cream-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bakery Presets</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mode === 'url'
              ? 'bg-white dark:bg-chocolate-800 text-chocolate-900 dark:text-gold-300 shadow-xs'
              : 'text-chocolate-700 dark:text-cream-200'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </button>
      </div>

      {mode === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-gold-500 bg-gold-500/10'
              : 'border-gold-500/30 hover:border-gold-500/60 bg-cream-50 dark:bg-chocolate-900/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <Upload className="w-8 h-8 mx-auto text-gold-500 mb-2 opacity-80" />
          <p className="text-xs font-bold text-chocolate-900 dark:text-cream-100">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-[10px] text-chocolate-600 dark:text-cream-300 mt-1">
            PNG, JPG, WEBP, GIF up to 10MB
          </p>
        </div>
      )}

      {mode === 'preset' && (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
          {PRESET_BAKERY_IMAGES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                value === preset.url
                  ? 'border-gold-500 ring-2 ring-gold-500/50'
                  : 'border-transparent hover:border-gold-400'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-chocolate-950/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition-opacity">
                <span className="text-[9px] text-white font-semibold truncate leading-tight">
                  {preset.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {mode === 'url' && (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://example.com/artisan-cake.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-chocolate-900 border border-gold-500/30 text-xs text-chocolate-900 dark:text-cream-100 placeholder:text-chocolate-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:border-gold-500"
          />
          <button
            type="button"
            onClick={() => {
              if (urlInput.trim()) {
                onChange(urlInput.trim());
              }
            }}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-chocolate-950 text-xs font-bold transition-all cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

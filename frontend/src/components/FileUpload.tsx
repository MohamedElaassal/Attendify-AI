import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  onChange: (files: File[]) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({
  multiple = false,
  maxFiles = 5,
  onChange,
  accept = 'image/*',
  label = 'Telecharger des photos',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const filesToAdd = multiple
      ? selectedFiles.slice(0, maxFiles - files.length)
      : [selectedFiles[0]];

    const newFiles = [...files, ...filesToAdd];
    setFiles(newFiles);
    onChange(newFiles);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-5 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50">
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={!multiple && files.length >= 1}
          />
          <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {multiple ? `Maximum ${maxFiles} fichiers` : 'Un seul fichier'}
          </p>
        </div>
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                <ImageIcon className="h-3 w-3 mr-1" />
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

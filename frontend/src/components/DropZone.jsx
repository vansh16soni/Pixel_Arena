import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image, X, CheckCircle } from "lucide-react";
import clsx from "clsx";

export default function DropZone({ onFile, accept = "image/*", label = "Drop image here", preview = true }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length === 0) return;
      const f = accepted[0];
      setFile(f);
      if (preview) {
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);
      }
      onFile(f);
    },
    [onFile, preview]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
  });

  const clear = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    onFile(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={clsx(
          "relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[200px] p-6 text-center",
          isDragActive && !isDragReject && "border-neon bg-neon/5 shadow-neon",
          isDragReject && "border-danger bg-danger/5",
          !isDragActive && !file && "border-border hover:border-accent/50 hover:bg-accent/5",
          file && "border-accent/50 bg-accent/5"
        )}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <div className="relative w-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-xl object-contain"
            />
            <button
              onClick={clear}
              className="absolute top-2 right-2 w-7 h-7 bg-danger/80 rounded-full flex items-center justify-center hover:bg-danger transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-neon text-sm font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>{file.name}</span>
            </div>
          </div>
        ) : (
          <>
            <div
              className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                isDragActive ? "bg-neon/20 scale-110" : "bg-accent/10"
              )}
            >
              {isDragActive ? (
                <Image className="w-7 h-7 text-neon" />
              ) : (
                <Upload className="w-7 h-7 text-accent" />
              )}
            </div>
            <p className="font-display font-semibold text-slate-300 mb-1">
              {isDragActive ? "Drop it!" : label}
            </p>
            <p className="text-sm text-slate-500 font-body">
              PNG, JPG, WEBP — max 20MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

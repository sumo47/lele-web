'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Camera,
  RefreshCw,
  ImageIcon,
} from 'lucide-react';
import { apiUploadProfilePhoto } from '@/lib/uploadApi';
import type { UploadImageResult } from '@/lib/types';
import {
  validateImageFile,
  createImagePreview,
  revokeImagePreview,
  formatBytes,
} from '@/lib/uploadValidation';
import UserAvatar from './UserAvatar';

export interface ProfilePhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName?: string;
  onSuccess: (result: UploadImageResult) => void;
}

export default function ProfilePhotoUploadModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName,
  onSuccess,
}: ProfilePhotoUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clean up object URL when component unmounts or preview changes
  const clearSelection = useCallback(() => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setErrorMsg(null);
    setProgress(0);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleClose = useCallback(() => {
    if (uploading) return;
    clearSelection();
    onClose();
  }, [uploading, clearSelection, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !uploading) {
        handleClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, uploading, handleClose]);

  const processFile = (file: File) => {
    setErrorMsg(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file');
      return;
    }

    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }

    const url = createImagePreview(file);
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setErrorMsg(null);
    setProgress(0);

    try {
      const result = await apiUploadProfilePhoto(selectedFile, (pct) => {
        setProgress(pct);
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess(result);
        handleClose();
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to upload profile photo. Please try again.';
      setErrorMsg(message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-photo-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upload-photo-title" className="text-base font-bold text-gray-900">
                Change Profile Photo
              </h2>
              <p className="text-xs text-gray-500">
                Upload a JPEG, PNG, or WebP photo up to 5 MB
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Upload Error:</span> {errorMsg}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="font-semibold">Photo updated successfully! Refreshing...</span>
            </div>
          )}

          {/* Side-by-Side Avatar Comparison or Drag & Drop Area */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-red-500 bg-red-50/60 scale-[1.01]'
                  : 'border-gray-200 hover:border-red-400 hover:bg-red-50/20'
              }`}
            >
              <div className="relative">
                <UserAvatar
                  src={currentAvatarUrl}
                  name={userName}
                  size="lg"
                  className="shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <UploadCloud className="w-4 h-4" />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Click to choose a photo or drag and drop here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or WebP &bull; Maximum file size 5 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Cards */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Current Photo
                  </span>
                  <div className="flex justify-center">
                    <UserAvatar
                      src={currentAvatarUrl}
                      name={userName}
                      size="lg"
                    />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">
                    New Preview
                  </span>
                  <div className="flex justify-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-red-500 shadow-md">
                      <Image
                        src={previewUrl}
                        alt="New photo preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected File Details */}
              {selectedFile && (
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-gray-600">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{selectedFile.name}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-gray-500">
                    {formatBytes(selectedFile.size)}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                      Uploading & Optimizing...
                    </span>
                    <span className="font-bold text-red-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200/60 transition disabled:opacity-40"
          >
            Cancel
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={clearSelection}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Choose Another
            </button>
          )}

          <button
            type="button"
            onClick={previewUrl ? handleUpload : () => fileInputRef.current?.click()}
            disabled={uploading || success}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : previewUrl ? (
              <>
                <UploadCloud className="w-4 h-4" />
                Save Profile Photo
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Browse Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  File,
  Image,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  validateFile,
  uploadMultipleFiles,
  formatFileSize,
  isImageFile,
  isVideoFile,
  createImagePreview,
  FILE_CONFIGS,
  FileUploadResult
} from '@/lib/fileUpload';

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: FileUploadResult;
}

interface FileUploadProps {
  type: 'bloodTests' | 'medicalRecords';
  onFilesUploaded?: (results: FileUploadResult[]) => void;
  maxFiles?: number;
  className?: string;
  userId: string;
  caseId?: string;
}

export function FileUpload({
  type,
  onFilesUploaded,
  maxFiles = 10,
  className,
  userId,
  caseId
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_CONFIGS[type];

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    // Validate and prepare files
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];
      const validation = validateFile(file, config);

      if (validation.isValid) {
        const uploadedFile: UploadedFile = {
          file,
          status: 'pending'
        };

        // Create preview for images
        if (isImageFile(file)) {
          try {
            uploadedFile.preview = await createImagePreview(file);
          } catch (error) {
            console.warn('Failed to create image preview:', error);
          }
        }

        newFiles.push(uploadedFile);
      } else {
        // Show validation error
        newFiles.push({
          file,
          status: 'error',
          result: { success: false, error: validation.error }
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, config]);

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Update files to uploading status
      setFiles(prev => prev.map(f =>
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ));

      const filesToUpload = pendingFiles.map(f => f.file);
      const results = await uploadMultipleFiles(
        filesToUpload,
        config.bucket,
        userId,
        caseId,
        (completed, total) => {
          setUploadProgress((completed / total) * 100);
        }
      );

      // Update files with results
      setFiles(prev => {
        const updated = [...prev];
        let resultIndex = 0;

        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status === 'uploading') {
            updated[i] = {
              ...updated[i],
              status: results[resultIndex].success ? 'success' : 'error',
              result: results[resultIndex]
            };
            resultIndex++;
          }
        }

        return updated;
      });

      // Call callback with successful uploads
      const successfulUploads = results.filter(r => r.success);
      if (onFilesUploaded && successfulUploads.length > 0) {
        onFilesUploaded(successfulUploads);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error', result: { success: false, error: 'Upload failed' }}
          : f
      ));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [files, config.bucket, userId, caseId, onFilesUploaded]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return <Image className="h-4 w-4" />;
    if (isVideoFile(file)) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const pendingFilesCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {type === 'bloodTests' ? 'Upload Blood Test Images' : 'Upload Medical Records'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here, or click to select files
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          {config.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, up to {Math.round(config.maxSize / (1024 * 1024))}MB each
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={config.allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            {pendingFilesCount > 0 && (
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                size="sm"
              >
                Upload {pendingFilesCount} files
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                {/* File Icon or Preview */}
                <div className="flex-shrink-0">
                  {fileItem.preview ? (
                    <img
                      src={fileItem.preview}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(fileItem.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileItem.file.size)}
                  </p>
                  {fileItem.result?.error && (
                    <p className="text-xs text-red-500 mt-1">{fileItem.result.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      fileItem.status === 'success' ? 'default' :
                      fileItem.status === 'error' ? 'destructive' :
                      fileItem.status === 'uploading' ? 'secondary' : 'outline'
                    }
                  >
                    {fileItem.status}
                  </Badge>
                  {getStatusIcon(fileItem.status)}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={fileItem.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Summary */}
      {files.some(f => f.status === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files failed to upload. Please check the errors above and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
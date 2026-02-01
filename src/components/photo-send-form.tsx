'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from './copy-button';
import { useToast } from '@/hooks/use-toast';
import { generatePhotoCodeAction, type PhotoSendState } from '@/app/transfer/actions';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/webp': ['.webp'],
};

export function PhotoSendForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        toast({
          title: 'File too large',
          description: `The selected file exceeds the 10MB size limit.`,
          variant: 'destructive',
        });
      } else if (error.code === 'file-invalid-type') {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PNG, JPEG, or WebP image.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const handleGenerateCode = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const result: PhotoSendState = await generatePhotoCodeAction({}, formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.code) {
        setGeneratedCode(result.code);
        setShowCode(true);
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setIsUploading(false);
    setGeneratedCode(null);
    setShowCode(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
  
  if (showCode && generatedCode) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Code Generated</CardTitle>
          <CardDescription>Enter this code on your other device to retrieve the photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Your unique code is:</p>
            <div className="flex items-center space-x-2">
              <p className="font-code text-4xl font-semibold tracking-widest text-primary">{generatedCode}</p>
              <CopyButton textToCopy={generatedCode} />
            </div>
            <p className="text-xs text-muted-foreground">Expires in 5 minutes. Use once.</p>
          </div>
          <div className="flex justify-center">
            <Button variant="link" onClick={handleReset}>
              Send another photo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Send Photo</CardTitle>
        <CardDescription>Select or drop an image file below to generate a unique code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {file ? (
          <div className="space-y-4">
            <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-lg border">
              {previewUrl && <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />}
            </div>
            {isUploading && (
              <div className="space-y-2">
                <p className="text-center text-sm text-muted-foreground">Uploading...</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-4">
              <Button onClick={handleGenerateCode} disabled={isUploading}>
                {isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Generate Code
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isUploading}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-input'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isDragActive ? 'Drop the file here' : 'Drag & drop, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

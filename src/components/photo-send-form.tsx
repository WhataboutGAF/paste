'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from './copy-button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useStorage, useFirestore, useUser } from '@/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/webp': ['.webp'],
};
const CODE_LENGTH = 5;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PHOTO_STORE_COLLECTION = 'imageTransfers';
const TTL = 5 * 60 * 1000; // 5 minutes

export function PhotoSendForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const storage = useStorage();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
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

  const generateCode = () => {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    // Note: This client-side generation has a small chance of collision.
    // For a high-traffic app, a server-side unique code generation would be better.
    return code;
  };

  const handleGenerateCode = async () => {
    if (!file || !auth || !storage || !firestore || !user) {
        toast({
            title: 'Error',
            description: 'Services not available or not authenticated. Please try again later.',
            variant: 'destructive',
        });
        return;
    }

    setIsUploading(true);

    const code = generateCode();
    const filePath = `photos/${code}/${file.name}`;
    const storageRef = ref(storage, filePath);

    try {
      // 1. Upload file to Storage
      await uploadBytes(storageRef, file, { contentType: file.type });

      // 2. Create Firestore record
      const expiresAt = Timestamp.fromMillis(Date.now() + TTL);
      await addDoc(collection(firestore, PHOTO_STORE_COLLECTION), {
        code,
        filePath,
        createdAt: serverTimestamp(),
        expiresAt,
      });

      setGeneratedCode(code);
      setShowCode(true);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Missing or insufficient permissions.',
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
              <Button onClick={handleGenerateCode} disabled={isUploading || isUserLoading || !user}>
                {isUploading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isUserLoading || !user ? 'Authenticating...' : isUploading ? 'Uploading...' : 'Generate Code'}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isUploading || isUserLoading || !user}>
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

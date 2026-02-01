'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { getImageAction, type ReceiveState } from '@/app/transfer/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HistoryButton } from './history-button';
import { Skeleton } from './ui/skeleton';

const initialState: ReceiveState = {
  text: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Retrieving...
        </>
      ) : (
        <>
          Get Photo
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function PhotoReceiveForm() {
  const [state, formAction] = useActionState(getImageAction, initialState);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
      setImageUrl(null);
      setIsLoading(false);
    }
    if (state?.text) { // In this form, 'text' holds the image URL
      setImageUrl(state.text);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleFormAction = (formData: FormData) => {
    setIsLoading(true);
    formAction(formData);
  };
  
  const handleReset = () => {
    setImageUrl(null);
    setIsLoading(false);
    formRef.current?.reset();
  };

  if (isLoading) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Fetching Your Image...</CardTitle>
          <CardDescription>Please wait a moment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (imageUrl) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Photo Received</CardTitle>
              <CardDescription>Here is the photo from the other device.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image src={imageUrl} alt="Received photo" layout="fill" objectFit="contain" />
          </div>
          <Button variant="link" onClick={handleReset}>
            Receive another photo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Receive Photo</CardTitle>
            <CardDescription>Enter the code from your other device to instantly receive the photo.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleFormAction} className="space-y-4">
          <Input
            name="code"
            placeholder="e.g. ABCDE"
            className="font-code text-center text-lg tracking-widest"
            maxLength={5}
            required
            autoCapitalize="characters"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
            autoFocus
          />
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

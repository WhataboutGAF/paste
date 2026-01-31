'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { getTextAction, type ReceiveState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { CopyButton } from './copy-button';
import { HistoryButton } from './history-button';

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
          Get Text
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function ReceiveForm() {
  const [state, formAction] = useActionState(getTextAction, initialState);
  const [showText, setShowText] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
      setShowText(false);
    }
    if (state?.text) {
      setShowText(true);
    }
  }, [state, toast]);

  const handleReset = () => {
    setShowText(false);
    formRef.current?.reset();
    // A simple way to reset form state for this use case
    if (initialState.text) initialState.text = null;
    if (initialState.error) initialState.error = null;
  };

  if (showText && state?.text) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Text Received</CardTitle>
              <CardDescription>Here is the text from the other device. You can copy it now.</CardDescription>
            </div>
            <HistoryButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea value={state.text} readOnly className="min-h-[200px] resize-y" />
            <CopyButton textToCopy={state.text} className="absolute right-2 top-2" />
          </div>
          <Button variant="link" onClick={handleReset}>
            Receive another text
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
            <CardTitle>Receive Text</CardTitle>
            <CardDescription>Enter the code from your other device to instantly receive the text.</CardDescription>
          </div>
          <HistoryButton />
        </div>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <Input
            name="code"
            placeholder="e.g. ABCD"
            className="font-code text-center text-lg tracking-widest"
            maxLength={4}
            required
            autoCapitalize="characters"
            onChange={(e) => (e.target.value = e.target.value.toUpperCase())}
          />
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

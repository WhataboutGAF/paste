'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { generateCodeAction, type SendState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from './copy-button';

const initialState: SendState = {
  code: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          Generate Code
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function SendForm() {
  const [state, formAction] = useActionState(generateCodeAction, initialState);
  const [text, setText] = useState('');
  const [showCode, setShowCode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
      setShowCode(false);
    }
    if (state?.code) {
      setShowCode(true);
    }
  }, [state, toast]);

  const handleReset = () => {
    setShowCode(false);
    setText('');
    formRef.current?.reset();
    // A simple way to reset form state for this use case
    if (initialState.code) initialState.code = null;
    if (initialState.error) initialState.error = null;
  };

  if (showCode && state?.code) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Code Generated</CardTitle>
          <CardDescription>Enter this code on your other device to retrieve the text.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Your unique code is:</p>
            <div className="flex items-center space-x-2">
              <p className="font-code text-4xl font-semibold tracking-widest text-accent">{state.code}</p>
              <CopyButton textToCopy={state.code} />
            </div>
            <p className="text-xs text-muted-foreground">Expires in 5 minutes. Use once.</p>
            <Button variant="link" onClick={handleReset}>
              Send another text
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Send Text</CardTitle>
        <CardDescription>Paste your text below and generate a unique code to receive it on another device.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="relative">
            <Textarea
              name="text"
              placeholder="Paste your text here..."
              className="min-h-[200px] resize-y"
              maxLength={10000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <p className="absolute bottom-3 right-3 text-xs text-muted-foreground">{text.length} / 10000</p>
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

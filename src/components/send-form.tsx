'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { generateCodeAction, type SendState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';
import { CopyButton } from './copy-button';
import { HistoryButton } from './history-button';

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

interface SendFormProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function SendForm({ text, onTextChange }: SendFormProps) {
  const [state, formAction] = useActionState(generateCodeAction, initialState);
  const [showCode, setShowCode] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();

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
      if (text && state.code) {
        addHistoryItem({ text, code: state.code });
      }
    }
  }, [state, toast, addHistoryItem, text]);

  const handleReset = () => {
    setShowCode(false);
    formRef.current?.reset();
    if (initialState.code) initialState.code = null;
    if (initialState.error) initialState.error = null;
  };

  if (showCode && state?.code) {
    return (
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Code Generated</CardTitle>
              <CardDescription>Enter this code on your other device to retrieve the text.</CardDescription>
            </div>
            <HistoryButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">Your unique code is:</p>
            <div className="flex items-center space-x-2">
              <p className="font-code text-4xl font-semibold tracking-widest text-accent">{state.code}</p>
              <CopyButton textToCopy={state.code} />
            </div>
            <p className="text-xs text-muted-foreground">Expires in 5 minutes. Use once.</p>
          </div>
          <div className="flex justify-center">
            <Button variant="link" onClick={handleReset}>
              Send the same text again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Send Text</CardTitle>
            <CardDescription>Paste your text below and generate a unique code to receive it on another device.</CardDescription>
          </div>
          <HistoryButton />
        </div>
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
              onChange={(e) => onTextChange(e.target.value)}
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

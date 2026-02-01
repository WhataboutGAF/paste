'use client';

import { useRef, useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from './copy-button';
import { HistoryButton } from './history-button';
import { generateCodeAction, type SendState } from '@/app/transfer/actions';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';

const initialSendState: SendState = {
  code: null,
  error: null,
  text: null,
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

export function TextSendForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [sendText, setSendText] = useState('');
  const [state, formAction] = useActionState(generateCodeAction, initialSendState);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { addHistoryItem } = useHistory();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
      setShowCode(false);
      setGeneratedCode(null);
    }
    if (state?.code && state.text) {
      setGeneratedCode(state.code);
      setShowCode(true);
      addHistoryItem({ text: state.text, code: state.code });
    }
  }, [state, toast, addHistoryItem]);

  const handleReset = () => {
    setShowCode(false);
    setGeneratedCode(null);
    setSendText('');
    formRef.current?.reset();
  };
  
  if (showCode && generatedCode) {
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
              <p className="font-code text-4xl font-semibold tracking-widest text-primary">{generatedCode}</p>
              <CopyButton textToCopy={generatedCode} />
            </div>
            <p className="text-xs text-muted-foreground">Expires in 5 minutes. Use once.</p>
          </div>
          <div className="flex justify-center">
            <Button variant="link" onClick={handleReset}>
              Send new text
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
              value={sendText}
              onChange={(e) => setSendText(e.target.value)}
              required
            />
            <p className="absolute bottom-3 right-3 text-xs text-muted-foreground">{sendText.length} / 10000</p>
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

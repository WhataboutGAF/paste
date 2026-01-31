'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from './copy-button';
import { HistoryButton } from './history-button';

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
  formAction: (payload: FormData) => void;
  code: string | null;
  showCode: boolean;
  onReset: () => void;
}

export function SendForm({ text, onTextChange, formAction, code, showCode, onReset }: SendFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleReset = () => {
    onReset();
    formRef.current?.reset();
  };

  if (showCode && code) {
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
              <p className="font-code text-4xl font-semibold tracking-widest text-primary">{code}</p>
              <CopyButton textToCopy={code} />
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

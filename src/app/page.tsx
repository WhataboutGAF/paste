'use client';

import { useState, useActionState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendForm } from '@/components/send-form';
import { ReceiveForm } from '@/components/receive-form';
import { generateCodeAction, type SendState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';

const initialSendState: SendState = {
  code: null,
  error: null,
};

export default function Home() {
  const [sendText, setSendText] = useState('');
  // State for the text that has a generated code
  const [sentText, setSentText] = useState<string | null>(null);

  const [state, formAction] = useActionState(generateCodeAction, initialSendState);
  const [showCode, setShowCode] = useState(false);
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
    }
    if (state?.code) {
      setSentText(sendText);
      setShowCode(true);
      if (sendText) {
        addHistoryItem({ text: sendText, code: state.code });
      }
    }
  }, [state, toast, addHistoryItem, sendText]);

  useEffect(() => {
    // If the text has changed from what was sent, hide the code.
    if (sentText !== null && sendText !== sentText) {
      setShowCode(false);
      setSentText(null);
    }
  }, [sendText, sentText]);

  const handleReset = () => {
    setShowCode(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 py-8 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">QuickPaste</h1>
          <p className="mt-4 text-lg text-muted-foreground">Instantly transfer text between devices. No login, no hassle.</p>
        </div>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="mt-6">
            <SendForm
              text={sendText}
              onTextChange={setSendText}
              formAction={formAction}
              state={state}
              showCode={showCode}
              onReset={handleReset}
            />
          </TabsContent>
          <TabsContent value="receive" className="mt-6">
            <ReceiveForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SendForm } from '@/components/send-form';
import { ReceiveForm } from '@/components/receive-form';

export default function Home() {
  const [sendText, setSendText] = useState('');

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
            <SendForm text={sendText} onTextChange={setSendText} />
          </TabsContent>
          <TabsContent value="receive" className="mt-6">
            <ReceiveForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextSendForm } from '@/components/text-send-form';
import { TextReceiveForm } from '@/components/text-receive-form';
import { PhotoSendForm } from '@/components/photo-send-form';
import { PhotoReceiveForm } from '@/components/photo-receive-form';

export default function TransferPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 py-8 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">QuickPaste</h1>
          <p className="mt-4 text-lg text-muted-foreground">Instantly transfer text or photos between devices. No login, no hassle.</p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="photo">Photo</TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-6">
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>
              <TabsContent value="send" className="mt-6">
                <TextSendForm />
              </TabsContent>
              <TabsContent value="receive" className="mt-6">
                <TextReceiveForm />
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="photo" className="mt-6">
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send">Send</TabsTrigger>
                <TabsTrigger value="receive">Receive</TabsTrigger>
              </TabsList>
              <TabsContent value="send" className="mt-6">
                <PhotoSendForm />
              </TabsContent>
              <TabsContent value="receive" className="mt-6">
                <PhotoReceiveForm />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

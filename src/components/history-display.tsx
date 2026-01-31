'use client';

import { History, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useHistory } from '@/hooks/use-history';
import { CopyButton } from './copy-button';

export function HistoryDisplay() {
  const { history, clearHistory, isLoaded } = useHistory();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="mt-8 w-full">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 sm:items-center">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6" />
              <span>Send History</span>
            </CardTitle>
            <CardDescription>
              {history.length > 0
                ? `Your last ${history.length} sent item(s). This is stored in your browser.`
                : 'Your send history will appear here after you send something.'}
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="shrink-0">
              <Trash2 className="mr-0 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear History</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {history.map((item) => (
                <AccordionItem value={item.code} key={item.code}>
                  <AccordionTrigger>
                    <div className="flex w-full items-center justify-between gap-4 pr-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="font-code text-lg text-accent">{item.code}</span>
                        <span className="min-w-0 flex-1 truncate text-left text-sm text-muted-foreground">
                          {item.text.replace(/\n/g, ' ')}
                        </span>
                      </div>
                      <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Code:</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-code text-4xl font-semibold tracking-widest text-accent">{item.code}</p>
                          <CopyButton textToCopy={item.code} />
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-sm text-muted-foreground">Text:</p>
                        <div className="relative">
                          <pre className="w-full whitespace-pre-wrap break-words rounded-md bg-muted p-4 font-sans text-sm">
                            {item.text}
                          </pre>
                          <CopyButton textToCopy={item.text} className="absolute right-2 top-2" />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">You haven't sent any text yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use server';

import { z } from 'zod';
import { storeText, retrieveText } from '@/lib/storage';

export type SendState = {
  code?: string | null;
  error?: string | null;
};

const sendSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty.').max(10000, 'Text cannot exceed 10,000 characters.'),
});

export async function generateCodeAction(prevState: SendState, formData: FormData): Promise<SendState> {
  const validatedFields = sendSchema.safeParse({
    text: formData.get('text'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.text?.[0],
    };
  }

  try {
    const code = storeText(validatedFields.data.text);
    return { code };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred.' };
  }
}

export type ReceiveState = {
  text?: string | null;
  error?: string | null;
};

const receiveSchema = z.object({
  code: z.string().min(4, 'Code must be 4 characters.').max(4, 'Code must be 4 characters.'),
});

export async function getTextAction(prevState: ReceiveState, formData: FormData): Promise<ReceiveState> {
  const validatedFields = receiveSchema.safeParse({
    code: formData.get('code'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.code?.[0],
    };
  }

  const text = retrieveText(validatedFields.data.code);

  if (text) {
    return { text };
  } else {
    return { error: 'Code not found or expired. Please try again.' };
  }
}

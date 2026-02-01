'use server';

import { z } from 'zod';
import { storeText, retrieveText, retrievePhoto } from '@/lib/storage';

// --- Text Transfer States and Actions ---

export type SendState = {
  code?: string | null;
  error?: string | null;
  text?: string | null;
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
    const code = await storeText(validatedFields.data.text);
    return { code, text: validatedFields.data.text };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred.' };
  }
}

export type ReceiveState = {
  text?: string | null; // Can hold text or an image URL
  error?: string | null;
};

const receiveSchema = z.object({
  code: z.string().min(1, 'Code cannot be empty.'),
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

  const text = await retrieveText(validatedFields.data.code);

  if (text) {
    return { text };
  } else {
    return { error: 'Code not found or expired. Please try again.' };
  }
}


// --- Photo Transfer States and Actions ---

export type PhotoSendState = {
  code?: string | null;
  error?: string | null;
};

export async function getImageAction(prevState: ReceiveState, formData: FormData): Promise<ReceiveState> {
    const validatedFields = receiveSchema.safeParse({
        code: formData.get('code'),
    });

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.code?.[0],
        };
    }

    try {
        const imageUrl = await retrievePhoto(validatedFields.data.code);
        if (imageUrl) {
            return { text: imageUrl }; // Re-using 'text' field for the URL
        } else {
            return { error: 'Photo not found or expired. Please try again.' };
        }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        return { error: 'An unexpected error occurred while retrieving the photo.' };
    }
}

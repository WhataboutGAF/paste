'use server';

import { z } from 'zod';
import { storeText, retrieveText, storePhoto, retrievePhoto } from '@/lib/storage';

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

const photoSchema = z.object({
  photo: z
    .instanceof(File, { message: 'Photo is required.' })
    .refine((file) => file.size > 0, 'Photo cannot be empty.')
    .refine((file) => file.size <= 10 * 1024 * 1024, `File size must be less than 10MB.`)
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type),
      'Invalid file type. Only PNG, JPEG, and WebP are allowed.'
    ),
});

export async function generatePhotoCodeAction(
  prevState: PhotoSendState,
  formData: FormData,
): Promise<PhotoSendState> {
  const validatedFields = photoSchema.safeParse({
    photo: formData.get('photo'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return {
      error: errors.photo?.[0] || 'Invalid photo provided.',
    };
  }
  
  try {
    const code = await storePhoto(validatedFields.data.photo);
    return { code };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred during photo upload.' };
  }
}


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

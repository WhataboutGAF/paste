'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  doc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// --- Initialization ---
const { firestore, storage } = initializeFirebase();

const TEXT_STORE_COLLECTION = 'textTransfers';
const PHOTO_STORE_COLLECTION = 'imageTransfers';
const TTL = 5 * 60 * 1000; // 5 minutes

// --- Code Generation ---
const CODE_LENGTH_TEXT = 4;
const CODE_LENGTH_PHOTO = 5;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function generateUniqueCode(length: number, collectionName: string): Promise<string> {
  const db = firestore;
  let code: string;
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    const q = query(collection(db, collectionName), where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return code;
    }
    attempts++;
  } while (attempts < 10);
  throw new Error('Failed to generate a unique code.');
}

// --- Text Transfer ---

export async function storeText(text: string): Promise<string> {
  const db = firestore;
  const code = await generateUniqueCode(CODE_LENGTH_TEXT, TEXT_STORE_COLLECTION);
  const expiresAt = Timestamp.fromMillis(Date.now() + TTL);

  await addDoc(collection(db, TEXT_STORE_COLLECTION), {
    code,
    text,
    createdAt: serverTimestamp(),
    expiresAt,
  });

  return code;
}

export async function retrieveText(code: string): Promise<string | null> {
  const db = firestore;
  const q = query(
    collection(db, TEXT_STORE_COLLECTION),
    where('code', '==', code.toUpperCase()),
    where('expiresAt', '>', Timestamp.now())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  // Delete the document after retrieval
  await deleteDoc(doc.ref);

  return data.text;
}


// --- Photo Transfer ---

export async function storePhoto(
  file: File
): Promise<string> {
  const storage = getStorage();
  const db = firestore;

  // 1. Generate unique code
  const code = await generateUniqueCode(CODE_LENGTH_PHOTO, PHOTO_STORE_COLLECTION);
  const filePath = `photos/${code}/${file.name}`;
  const storageRef = ref(storage, filePath);

  // 2. Start the resumable upload
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  // 3. Return a promise that resolves with the code when done
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null, // No progress reporting
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload failed:', error);
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        // Handle successful uploads on complete
        try {
          // 4. Create Firestore record
          const expiresAt = Timestamp.fromMillis(Date.now() + TTL);
          await addDoc(collection(db, PHOTO_STORE_COLLECTION), {
            code,
            filePath,
            createdAt: serverTimestamp(),
            expiresAt,
          });
          resolve(code);
        } catch (dbError) {
          console.error('Firestore write failed:', dbError);
          // Attempt to clean up the uploaded file if DB write fails
          await deleteObject(storageRef).catch(delErr => console.error('Cleanup failed:', delErr));
          reject(new Error('Failed to save transfer record.'));
        }
      }
    );
  });
}


export async function retrievePhoto(code: string): Promise<string | null> {
  const db = firestore;
  const storage = getStorage();

  // 1. Find the document in Firestore
  const q = query(
    collection(db, PHOTO_STORE_COLLECTION),
    where('code', '==', code.toUpperCase()),
    where('expiresAt', '>', Timestamp.now())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docData = snapshot.docs[0];
  const { filePath } = docData.data();

  try {
    // 2. Get download URL from Storage
    const storageRef = ref(storage, filePath);
    const url = await getDownloadURL(storageRef);

    // 3. Delete Firestore record and Storage file
    await deleteDoc(docData.ref);
    await deleteObject(storageRef);

    return url;
  } catch (error) {
    console.error('Error retrieving or deleting photo:', error);
    // Attempt cleanup even if one part fails
    try {
      await deleteDoc(docData.ref);
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
    } catch (cleanupError) {
      console.error('Post-error cleanup failed:', cleanupError);
    }
    return null;
  }
}

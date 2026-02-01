
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
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
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const TEXT_STORE_COLLECTION = 'textTransfers';
const PHOTO_STORE_COLLECTION = 'imageTransfers';
const TTL = 5 * 60 * 1000; // 5 minutes

// Server-side initialization to be used ONLY within this file.
function getFirebaseServices() {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    return { app, firestore, storage };
}

// --- Code Generation ---
const CODE_LENGTH_TEXT = 4;
const CODE_LENGTH_PHOTO = 5;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function generateUniqueCode(length: number, collectionName: string): Promise<string> {
  const { firestore } = getFirebaseServices();
  let code: string;
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    const q = query(collection(firestore, collectionName), where('code', '==', code));
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
  const { firestore } = getFirebaseServices();
  const code = await generateUniqueCode(CODE_LENGTH_TEXT, TEXT_STORE_COLLECTION);
  const expiresAt = Timestamp.fromMillis(Date.now() + TTL);

  await addDoc(collection(firestore, TEXT_STORE_COLLECTION), {
    code,
    text,
    createdAt: serverTimestamp(),
    expiresAt,
  });

  return code;
}

export async function retrieveText(code: string): Promise<string | null> {
  const { firestore } = getFirebaseServices();
  const q = query(
    collection(firestore, TEXT_STORE_COLLECTION),
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

export async function storePhoto(file: File): Promise<string> {
  const { firestore, storage } = getFirebaseServices();
  const code = await generateUniqueCode(CODE_LENGTH_PHOTO, PHOTO_STORE_COLLECTION);
  const filePath = `photos/${code}/${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    // 1. Upload file
    await uploadBytes(storageRef, file, { contentType: file.type });

    // 2. Create Firestore record
    const expiresAt = Timestamp.fromMillis(Date.now() + TTL);
    await addDoc(collection(firestore, PHOTO_STORE_COLLECTION), {
      code,
      filePath,
      createdAt: serverTimestamp(),
      expiresAt,
    });

    return code;
  } catch (error) {
    console.error('Photo storage failed:', error);
    // Attempt to clean up failed upload
    await deleteObject(storageRef).catch(() => {});
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during photo upload.');
  }
}


export async function retrievePhoto(code: string): Promise<string | null> {
  const { firestore, storage } = getFirebaseServices();

  // 1. Find the document in Firestore
  const q = query(
    collection(firestore, PHOTO_STORE_COLLECTION),
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

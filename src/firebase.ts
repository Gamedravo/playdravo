import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  type AuthProvider,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, runTransaction, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const persistencePromise = setPersistence(auth, browserLocalPersistence).catch(console.error);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account' });
microsoftProvider.addScope('email');
microsoftProvider.addScope('profile');
microsoftProvider.addScope('openid');

export const githubProvider = new GithubAuthProvider();

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

async function signInWithOAuthPopup(provider: AuthProvider) {
  await persistencePromise;
  try {
    return await signInWithPopup(auth, provider);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/popup-blocked') {
      console.warn('Popup blocked, falling back to redirect...');
      return signInWithRedirect(auth, provider);
    }
    throw error;
  }
}

export const signInWithGoogle = () => signInWithOAuthPopup(googleProvider);
export const signInWithMicrosoft = () => signInWithOAuthPopup(microsoftProvider);
export const signInWithGithub = () => signInWithOAuthPopup(githubProvider);
export const signInWithApple = () => signInWithOAuthPopup(appleProvider);

export const logout = () => signOut(auth);

export const signInWithEmail = async (email: string, pass: string) => {
  await persistencePromise;
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = async (email: string, pass: string) => {
  await persistencePromise;
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const setupRecaptcha = (containerId: string) =>
  new RecaptchaVerifier(auth, containerId, { size: 'invisible' });

export const signInWithPhone = (phone: string, verifier: RecaptchaVerifier) =>
  signInWithPhoneNumber(auth, phone, verifier);

export { runTransaction, serverTimestamp };

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: (auth.currentUser?.providerData || []).map((provider) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL,
      })),
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

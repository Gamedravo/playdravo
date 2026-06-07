import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { getFirestore, runTransaction, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { signInWithOAuthPopup } from './lib/oauthSignIn';
import { getAuthActionCodeSettings } from './lib/authEmailConfig';

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

export const signInWithGoogle = async () => {
  await persistencePromise;
  return signInWithOAuthPopup(auth, googleProvider);
};
export const signInWithMicrosoft = async () => {
  await persistencePromise;
  return signInWithOAuthPopup(auth, microsoftProvider);
};
export const signInWithGithub = async () => {
  await persistencePromise;
  return signInWithOAuthPopup(auth, githubProvider);
};

export const logout = () => signOut(auth);

export const signInWithEmail = async (email: string, pass: string) => {
  await persistencePromise;
  return signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = async (email: string, pass: string) => {
  await persistencePromise;
  return createUserWithEmailAndPassword(auth, email, pass);
};

/** Password reset with @gamedravo.com action URL settings. */
export async function resetPassword(email: string) {
  await persistencePromise;
  return sendPasswordResetEmail(auth, email, getAuthActionCodeSettings('/'));
}

/** Email verification with @gamedravo.com action URL settings. */
export async function verifyUserEmail() {
  if (!auth.currentUser) throw new Error('No signed-in user');
  return sendEmailVerification(auth.currentUser, getAuthActionCodeSettings('/'));
}

/** Sends a verification link to change the current user's email address. */
export async function requestEmailChange(newEmail: string) {
  if (!auth.currentUser) throw new Error('No signed-in user');
  return verifyBeforeUpdateEmail(auth.currentUser, newEmail, getAuthActionCodeSettings('/'));
}

export { runTransaction, serverTimestamp };

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
  return errInfo;
}

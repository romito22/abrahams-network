import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
const env = import.meta.env;
export const configured = !!(
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_OWNER_UID
);
export const owner = env.VITE_OWNER_UID;
let auth, db;
if (configured) {
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
  db = getFirestore(app);
}
export const watchUser = (fn) =>
  configured ? onAuthStateChanged(auth, fn) : () => {};
export const login = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logout = () => signOut(auth);
export async function readPublic() {
  const s = await getDoc(doc(db, "cards", owner));
  return s.exists() ? s.data().profiles : null;
}
export async function publish(profiles) {
  if (auth.currentUser?.uid !== owner)
    throw Error("This account does not own this page.");
  if (new TextEncoder().encode(JSON.stringify(profiles)).length > 850000)
    throw Error(
      "Your photos exceed the publishing limit. Use smaller photos or fewer profiles.",
    );
  await setDoc(doc(db, "cards", owner), {
    profiles,
    updatedAt: new Date().toISOString(),
  });
}

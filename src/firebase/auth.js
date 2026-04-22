import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

// Profil initial RPG à la création du compte
export const INITIAL_PLAYER = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  rank: 'E',
  rankXP: 0,
  rankXPToNext: 500,
  gold: 0,
  stats: {
    strength: 10,
    agility: 10,
    endurance: 10,
    vitality: 10,
    intelligence: 10,
  },
  streak: 0,
  lastActiveDate: null,
  inventory: [],
  equippedItems: [],
  questsCompleted: 0,
  totalSteps: 0,
  dailySteps: 0,
  penalties: 0,
  title: 'Chasseur Débutant',
  aura: null,
}

export const register = async (email, password, username) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Créer le document Firestore avec le profil RPG initial
  await setDoc(doc(db, 'players', user.uid), {
    ...INITIAL_PLAYER,
    uid: user.uid,
    email: user.email,
    username: username || `Chasseur_${Math.floor(Math.random() * 9999)}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveDate: new Date().toDateString(),
  })

  return userCredential
}

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const signOut = () => firebaseSignOut(auth)

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)

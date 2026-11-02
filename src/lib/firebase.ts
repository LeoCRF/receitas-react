import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyARZbmE0jdrzAFHNDyvolJ6wED_JpEVJzo',
  authDomain: 'app-receitas-d5af2.firebaseapp.com',
  projectId: 'app-receitas-d5af2',
  storageBucket: 'app-receitas-d5af2.firebasestorage.app',
  messagingSenderId: '293844506336',
  appId: '1:293844506336:web:3b2f327cbc36b2833da285',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app);

export const db = getFirestore(app);
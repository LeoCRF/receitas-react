
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
// @ts-expect-error Exportação disponível na versão React Native do Firebase
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
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

export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);

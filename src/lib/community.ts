import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COMMUNITY_COLLECTION = 'communityRecipes';

export async function savePublicRecipe(recipe: any): Promise<string> {
    const docRef = await addDoc(collection(db, COMMUNITY_COLLECTION), {
        ...recipe,
        createdAt: serverTimestamp(),
        isPublic: true,
    });

    return docRef.id;
}

export async function getPublicRecipes(): Promise<any[]> {
    const recipesQuery = query(
        collection(db, COMMUNITY_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(recipesQuery);

    return snapshot.docs.map((doc) => ({
        ...doc.data(),
        idMeal: doc.id,
    }));
}


export async function getPublicRecipeById(id: string): Promise<any | undefined> {
    const recipeRef = doc(db, COMMUNITY_COLLECTION, id);
    const snapshot = await getDoc(recipeRef);

    if (!snapshot.exists()) {
        return undefined;
    }

    return {
        ...snapshot.data(),
        idMeal: snapshot.id,
    };
}

export async function updatePublicRecipe(
    id: string,
    userId: string,
    recipe: Record<string, unknown>
): Promise<void> {
    const recipeRef = doc(db, COMMUNITY_COLLECTION, id);

    await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(recipeRef);

        if (!snapshot.exists() || snapshot.data().createdBy !== userId) {
            throw new Error('Você só pode editar receitas publicadas por você.');
        }

        const existingRecipe = snapshot.data();

        transaction.set(recipeRef, {
            ...recipe,
            createdBy: userId,
            ...(existingRecipe.authorName
                ? { authorName: existingRecipe.authorName }
                : {}),
            ...(existingRecipe.createdAt
                ? { createdAt: existingRecipe.createdAt }
                : {}),
            isPublic: true,
        });
    });
}

export async function deletePublicRecipe(
    id: string,
    userId: string
): Promise<void> {
    const recipeRef = doc(db, COMMUNITY_COLLECTION, id);

    await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(recipeRef);

        if (!snapshot.exists() || snapshot.data().createdBy !== userId) {
            throw new Error('Você só pode excluir receitas publicadas por você.');
        }

        transaction.delete(recipeRef);
    });
}
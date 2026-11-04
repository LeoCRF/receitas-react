import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@receitas:favorites';
const CUSTOM_RECIPES_KEY = '@receitas:custom';

export async function getFavorites(): Promise<string[]> {
    const saved = await AsyncStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export async function toggleFavorite(id: string): Promise<string[]> {
    const favorites = await getFavorites();
    const updated = favorites.includes(id)
        ? favorites.filter((item) => item !== id)
        : [...favorites, id];

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
}

export async function getCustomRecipes(): Promise<any[]> {
    const saved = await AsyncStorage.getItem(CUSTOM_RECIPES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export async function getMyRecipes(userId: string): Promise<any[]> {
    const recipes = await getCustomRecipes();
    return recipes.filter((recipe) => recipe.createdBy === userId);
}

export async function saveCustomRecipe(recipe: any): Promise<void> {
    const recipes = await getCustomRecipes();
    await AsyncStorage.setItem(
        CUSTOM_RECIPES_KEY,
        JSON.stringify([recipe, ...recipes])
    );
}
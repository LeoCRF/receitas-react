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

export async function deleteCustomRecipe(
    recipeId: string,
    userId: string
): Promise<void> {
    if (!recipeId.startsWith('local_')) {
        throw new Error('Somente receitas personalizadas podem ser excluídas.');
    }

    const recipes = await getCustomRecipes();
    const recipeToDelete = recipes.find((recipe) => recipe.idMeal === recipeId);

    if (!recipeToDelete) {
        throw new Error('Receita não encontrada.');
    }

    if (!userId || recipeToDelete.createdBy !== userId) {
        throw new Error('Você só pode excluir receitas criadas por você.');
    }

    const updatedRecipes = recipes.filter(
        (recipe) =>
            recipe.idMeal !== recipeId || recipe.createdBy !== userId
    );

    await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(updatedRecipes));
}

export async function updateCustomRecipe(
    recipeId: string,
    userId: string,
    updates: Record<string, unknown>
): Promise<void> {
    if (!recipeId.startsWith('local_')) {
        throw new Error('Somente receitas personalizadas podem ser editadas.');
    }

    if (!userId) {
        throw new Error('É necessário entrar na conta para editar a receita.');
    }

    const recipes = await getCustomRecipes();
    const recipeIndex = recipes.findIndex(
        (recipe) => recipe.idMeal === recipeId
    );

    if (recipeIndex === -1) {
        throw new Error('Receita não encontrada.');
    }

    if (recipes[recipeIndex].createdBy !== userId) {
        throw new Error('Você só pode editar receitas criadas por você.');
    }

    const updatedRecipes = [...recipes];
    const currentRecipe = updatedRecipes[recipeIndex];
    const recipeWithoutOldIngredients = Object.fromEntries(
        Object.entries(currentRecipe).filter(
            ([key]) => !/^str(?:Ingredient|Measure)\d+$/.test(key)
        )
    );

    updatedRecipes[recipeIndex] = {
        ...recipeWithoutOldIngredients,
        ...updates,
        idMeal: recipeId,
        createdBy: userId,
    };

    await AsyncStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(updatedRecipes));
}
export type Meal = {
    idMeal: string;
    strMeal: string;
    strMealThumb: string;
    strCategory?: string;
    strArea?: string;
    strInstructions?: string;
    [key: string]: any;
};

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';


const CATEGORIES = [
    'Seafood',
    'Vegetarian',
    'Chicken',
    'Pasta',
    'Beef',
    'Dessert',
];


export async function getRecipes(): Promise<Meal[]> {
    const results = await Promise.all(
        CATEGORIES.map(async (category) => {
            const response = await fetch(
                `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
            );


            if (!response.ok) {
                throw new Error('Falha ao consultar as receitas');
            }


            const data = await response.json();

            return (data.meals ?? []).map((meal: Meal) => ({
                ...meal,
                strCategory: category,
            }));
        })
    );


    const unique = new Map<string, Meal>();


    results.flat().forEach((meal) => {
        if (!unique.has(meal.idMeal)) {
            unique.set(meal.idMeal, meal);
        }
    });


    return Array.from(unique.values());
}


export async function getRecipeById(id: string): Promise<Meal> {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);


    if (!response.ok) {
        throw new Error('Falha ao consultar detalhes');
    }


    const data = await response.json();

    if (!data.meals?.length) {
        throw new Error('Receita não encontrada');
    }


    return data.meals[0];
}


export function getIngredients(meal: Meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`]?.trim();
        const measure = meal[`strMeasure${i}`]?.trim();

        if (name) {
            ingredients.push(
                measure ? `${measure} ${name}` : name
            );
        }
    }

    return ingredients;
}

export type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  [key: string]: any;
};

const RECIPES: Meal[] = [
  {
    idMeal: 'bolo-de-cenoura',
    strMeal: 'Bolo de cenoura',
    strCategory: 'Sobremesa',
    strArea: 'Brasileira',
    strMealThumb: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800',
    strInstructions: `1. Preaqueça o forno a 180 °C.

2. Descasque e corte as cenouras em pedaços pequenos.

3. Bata no liquidificador as cenouras, os ovos e o óleo até obter uma mistura homogênea.

4. Acrescente o açúcar e bata novamente.

5. Transfira a mistura para uma tigela e adicione a farinha de trigo aos poucos, misturando bem.

6. Acrescente o fermento e misture delicadamente.

7. Despeje a massa em uma forma untada e enfarinhada.

8. Asse por aproximadamente 40 minutos ou até que um palito saia limpo ao espetar o bolo.`,
    strIngredient1: 'Cenoura',
    strMeasure1: '3 unidades médias',
    strIngredient2: 'Ovos',
    strMeasure2: '3 unidades',
    strIngredient3: 'Óleo',
    strMeasure3: '1 xícara',
    strIngredient4: 'Açúcar',
    strMeasure4: '2 xícaras',
    strIngredient5: 'Farinha de trigo',
    strMeasure5: '2 xícaras',
    strIngredient6: 'Fermento em pó',
    strMeasure6: '1 colher de sopa',
  },
  {
    idMeal: 'strogonoff-de-frango',
    strMeal: 'Strogonoff de frango',
    strCategory: 'Almoço',
    strArea: 'Brasileira',
    strMealThumb: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    strInstructions: `1. Corte o frango em cubos pequenos e tempere com sal e pimenta.

2. Aqueça o óleo ou azeite em uma panela e doure a cebola e o alho.

3. Acrescente o frango e cozinhe até ficar dourado e completamente cozido.

4. Adicione o ketchup e a mostarda, misturando bem.

5. Acrescente o creme de leite e misture em fogo baixo, sem deixar ferver intensamente.

6. Ajuste o sal e desligue o fogo.

7. Sirva acompanhado de arroz branco e batata palha.`,
    strIngredient1: 'Peito de frango',
    strMeasure1: '500 g',
    strIngredient2: 'Cebola',
    strMeasure2: '1 unidade',
    strIngredient3: 'Alho',
    strMeasure3: '2 dentes',
    strIngredient4: 'Óleo',
    strMeasure4: '2 colheres de sopa',
    strIngredient5: 'Ketchup',
    strMeasure5: '3 colheres de sopa',
    strIngredient6: 'Mostarda',
    strMeasure6: '1 colher de sopa',
    strIngredient7: 'Creme de leite',
    strMeasure7: '1 caixa',
    strIngredient8: 'Sal',
    strMeasure8: 'A gosto',
    strIngredient9: 'Pimenta-do-reino',
    strMeasure9: 'A gosto',
  },
  {
    idMeal: 'lasanha-a-bolonhesa',
    strMeal: 'Lasanha à bolonhesa',
    strCategory: 'Almoço',
    strArea: 'Italiana',
    strMealThumb: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800',
    strInstructions: `1. Preaqueça o forno a 180 °C.

2. Refogue a cebola e o alho em uma panela com azeite.

3. Acrescente a carne moída e cozinhe até dourar.

4. Adicione o molho de tomate, tempere com sal e pimenta e deixe cozinhar por aproximadamente 10 minutos.

5. Em um refratário, espalhe uma camada de molho.

6. Faça camadas alternadas de massa de lasanha, molho, presunto e queijo.

7. Repita as camadas até terminar os ingredientes, finalizando com queijo por cima.

8. Cubra com papel-alumínio e asse por aproximadamente 30 minutos.

9. Retire o papel-alumínio e deixe no forno por mais 10 minutos para gratinar.`,
    strIngredient1: 'Massa para lasanha',
    strMeasure1: '500 g',
    strIngredient2: 'Carne moída',
    strMeasure2: '500 g',
    strIngredient3: 'Molho de tomate',
    strMeasure3: '2 sachês',
    strIngredient4: 'Cebola',
    strMeasure4: '1 unidade',
    strIngredient5: 'Alho',
    strMeasure5: '2 dentes',
    strIngredient6: 'Presunto',
    strMeasure6: '200 g',
    strIngredient7: 'Queijo muçarela',
    strMeasure7: '300 g',
    strIngredient8: 'Azeite',
    strMeasure8: '2 colheres de sopa',
    strIngredient9: 'Sal e pimenta',
    strMeasure9: 'A gosto',
  },
  {
    idMeal: 'panqueca-de-carne-moida',
    strMeal: 'Panqueca de carne moída',
    strCategory: 'Almoço',
    strArea: 'Brasileira',
    strMealThumb: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    strInstructions: `1. Bata no liquidificador o leite, os ovos, a farinha de trigo, o óleo e o sal até formar uma massa homogênea.

2. Aqueça uma frigideira antiaderente e unte levemente com óleo.

3. Coloque uma pequena porção de massa e espalhe pelo fundo da frigideira.

4. Doure dos dois lados e reserve. Repita até terminar a massa.

5. Para o recheio, refogue a cebola e o alho em uma panela.

6. Acrescente a carne moída e cozinhe até dourar.

7. Adicione o molho de tomate, tempere com sal e pimenta e cozinhe por alguns minutos.

8. Recheie cada panqueca, enrole e coloque em um refratário.

9. Cubra com molho de tomate e queijo ralado.

10. Leve ao forno por aproximadamente 15 minutos para aquecer e gratinar.`,
    strIngredient1: 'Leite',
    strMeasure1: '2 xícaras',
    strIngredient2: 'Ovos',
    strMeasure2: '2 unidades',
    strIngredient3: 'Farinha de trigo',
    strMeasure3: '1 e 1/2 xícara',
    strIngredient4: 'Óleo',
    strMeasure4: '2 colheres de sopa',
    strIngredient5: 'Sal',
    strMeasure5: 'A gosto',
    strIngredient6: 'Carne moída',
    strMeasure6: '400 g',
    strIngredient7: 'Cebola',
    strMeasure7: '1 unidade',
    strIngredient8: 'Alho',
    strMeasure8: '2 dentes',
    strIngredient9: 'Molho de tomate',
    strMeasure9: '1 sachê',
    strIngredient10: 'Queijo ralado',
    strMeasure10: 'A gosto',
  },
  {
    idMeal: 'brigadeiro',
    strMeal: 'Brigadeiro',
    strCategory: 'Sobremesa',
    strArea: 'Brasileira',
    strMealThumb: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=800',
    strInstructions: `1. Coloque o leite condensado, o chocolate em pó e a manteiga em uma panela.

2. Misture bem antes de ligar o fogo.

3. Cozinhe em fogo baixo, mexendo sempre para não grudar no fundo da panela.

4. Continue mexendo até a mistura engrossar e começar a desgrudar do fundo.

5. Transfira para um prato untado com manteiga e deixe esfriar.

6. Unte as mãos com manteiga, faça pequenas bolinhas e passe no chocolate granulado.

7. Coloque em forminhas e sirva.`,
    strIngredient1: 'Leite condensado',
    strMeasure1: '1 lata',
    strIngredient2: 'Chocolate em pó',
    strMeasure2: '4 colheres de sopa',
    strIngredient3: 'Manteiga',
    strMeasure3: '1 colher de sopa',
    strIngredient4: 'Chocolate granulado',
    strMeasure4: 'A gosto',
  },
];


const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

const CATEGORIES = [
  'Seafood',
  'Vegetarian',
  'Chicken',
  'Pasta',
  'Beef',
  'Dessert',
];

let recipesCache: Meal[] | null = null;
let recipesPromise: Promise<Meal[]> | null = null;

export async function getRecipes(): Promise<Meal[]> {
  if (recipesCache) {
    return recipesCache;
  }

  if (recipesPromise) {
    return recipesPromise;
  }

  recipesPromise = (async () => {
    try {
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

      const apiRecipes = Array.from(unique.values()).slice(0, 45);

      recipesCache = [...RECIPES, ...apiRecipes];

      return recipesCache;
    } catch (error) {
      recipesPromise = null;
      throw error;
    }
  })();

  return recipesPromise;
}

export async function getRecipeById(id: string): Promise<Meal> {
  const localRecipe = RECIPES.find((meal) => meal.idMeal === id);

  if (localRecipe) {
    return localRecipe;
  }

  const response = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);

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


import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, Pressable, View,} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getIngredients, getRecipeById, type Meal, } from '../../../lib/recipes';

import { getFavorites, toggleFavorite, getCustomRecipes, } from '../../../lib/storage';

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMeal() {
      try {
        setLoading(true);
        setError('');

        if (!id) {
          throw new Error('ID da receita não encontrado');
        }

        let result: Meal | undefined;

        if (id.startsWith('local_')) {
          const customRecipes = await getCustomRecipes();
          result = customRecipes.find(
            (recipe: Meal) => recipe.idMeal === id
          );
        } else {
          result = await getRecipeById(id);
        }

        const favorites = await getFavorites();

        if (!result) {
          throw new Error('Receita não encontrada');
        }

        if (active) {
          setMeal(result);
          setFavorite(favorites.includes(id));
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar esta receita.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMeal();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleFavorite() {
    if (!id) return;

    try {
      const updated = await toggleFavorite(id);
      setFavorite(updated.includes(id));
    } catch {
      // Mantém o estado atual caso não seja possível salvar.
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B85C38" />
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || 'Receita não encontrada'}
        </Text>
      </View>
    );
  }

  const ingredients = getIngredients(meal);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: meal.strMealThumb }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.category}>
          {meal.strCategory || 'Receita'}
          {meal.strArea ? ` · ${meal.strArea}` : ''}
        </Text>

        <Text style={styles.title}>{meal.strMeal}</Text>

        <Pressable
          style={styles.favoriteButton}
          onPress={handleFavorite}
        >
          <Text style={styles.favoriteText}>
            {favorite
              ? '♥ Remover dos favoritos'
              : '♡ Adicionar aos favoritos'}
          </Text>
        </Pressable>

        <Text style={styles.heading}>Ingredientes</Text>

        {ingredients.length > 0 ? (
          ingredients.map((ingredient, index) => (
            <Text
              key={`${index}-${ingredient}`}
              style={styles.ingredient}
            >
              • {ingredient}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>
            Ingredientes não informados.
          </Text>
        )}

        <Text style={styles.heading}>Modo de preparo</Text>

        <Text style={styles.body}>
          {meal.strInstructions || 'Modo de preparo não informado.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  center: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#EFE7DE',
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  category: {
    color: '#B85C38',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    color: '#34251F',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 16,
  },
  favoriteButton: {
    backgroundColor: '#F2E1D4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  favoriteText: {
    color: '#8D432B',
    fontWeight: '700',
  },
  heading: {
    color: '#34251F',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  ingredient: {
    color: '#594B42',
    fontSize: 15,
    lineHeight: 25,
  },
  body: {
    color: '#594B42',
    fontSize: 15,
    lineHeight: 25,
  },
});

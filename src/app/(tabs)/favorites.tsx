
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import RecipeCard from '../../components/RecipeCard';
import { getRecipes, type Meal } from '../../lib/recipes';
import { getCustomRecipes, getFavorites } from '../../lib/storage';

export default function FavoritesScreen() {
  const router = useRouter();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadFavorites() {
        setLoading(true);

        try {
          const [favoriteIds, apiMeals, customMeals] = await Promise.all([
            getFavorites(),
            getRecipes(),
            getCustomRecipes(),
          ]);

          const allMeals = [...customMeals, ...apiMeals];

          const favoriteMeals = allMeals.filter((meal) =>
            favoriteIds.includes(meal.idMeal)
          );

          if (active) {
            setMeals(favoriteMeals);
          }
        } catch {
          if (active) {
            setMeals([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadFavorites();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus favoritos</Text>
      <Text style={styles.subtitle}>
        Receitas guardadas para depois
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#B85C38" />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <RecipeCard
              meal={item}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: item.idMeal },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Você não tem receitas favoritas
            </Text>
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    paddingTop: 58,
    paddingHorizontal: 20,
  },

  title: {
    color: '#34251F',
    fontSize: 20,
    fontWeight: '800',
  },

  subtitle: {
    color: '#776A60',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
  },

  list: {
    paddingBottom: 30,
  },

  empty: {
    color: '#776A60',
    textAlign: 'center',
    marginTop: 35,
    lineHeight: 22,
  },
});

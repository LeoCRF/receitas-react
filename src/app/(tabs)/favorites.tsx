
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={42} color="#B85C38" />
              </View>

              <Text style={styles.emptyTitle}>
                Nenhuma receita por aqui ainda!
              </Text>

              <Text style={styles.emptyDescription}>
                Suas receitas favoritas aparecerão aqui. Explore nosso livro de receitas e salve as que mais gostar.
              </Text>

              <Pressable style={styles.exploreButton} onPress={() => router.replace('/(tabs)')}>
                <Text style={styles.exploreButtonText}>Explorar receitas</Text>
              </Pressable>
            </View>
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
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: '#F5E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    color: '#34251F',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyDescription: {
    color: '#776A60',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 280,
  },

  exploreButton: {
    backgroundColor: '#B85C38',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 22,
  },

  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

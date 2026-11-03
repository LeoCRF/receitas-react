
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import RecipeCard from '../../components/RecipeCard';
import { getRecipes, type Meal } from '../../lib/recipes';

export default function HomeScreen() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
  let active = true;

  async function loadRecipes() {
    setLoading(true);
    setError('');

    try {
      const allRecipes = await getRecipes();

      if (active) {
        setRecipes(allRecipes);
      }
    } catch {
      if (active) {
        setError(
          'Não foi possível carregar as receitas. Tente novamente mais tarde.'
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadRecipes();

  return () => {
    active = false;
  };
}, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.strMeal.toLowerCase().includes(search.toLowerCase())
  );

  const visibleRecipes = filteredRecipes.slice(0, visibleCount);

  function loadMoreRecipes() {
    if (visibleCount < filteredRecipes.length) {
      setVisibleCount((current) =>
        Math.min(current + 10, filteredRecipes.length)
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>SUA COZINHA</Text>
      <Text style={styles.title}>Receitas</Text>
      <Text style={styles.subtitle}>
        Encontre uma receita para preparar
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar uma receita..."
        placeholderTextColor="#8B8179"
        value={search}
        onChangeText={(value) => {
          setSearch(value);
          setVisibleCount(10);
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#B85C38"
          style={styles.loader}
        />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <FlatList
          data={visibleRecipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <RecipeCard
              meal={item}
              onPress={() => {
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: item.idMeal },
                });
              }}
            />
          )}
          onEndReached={loadMoreRecipes}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.message}>
              Nenhuma receita encontrada.
            </Text>
          }
          showsVerticalScrollIndicator={false}
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
  eyebrow: {
    color: '#B85C38',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#34251F',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 5,
  },
  subtitle: {
    color: '#776A60',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 20,
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DCCF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: '#34251F',
    marginBottom: 20,
    fontSize: 15,
  },
  list: {
    paddingBottom: 30,
  },
  loader: {
    marginTop: 40,
  },
  message: {
    color: '#776A60',
    textAlign: 'center',
    marginTop: 30,
  },
});

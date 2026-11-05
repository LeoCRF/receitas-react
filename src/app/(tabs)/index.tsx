import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useScrollToTop } from 'expo-router';

import RecipeCard from '../../components/RecipeCard';
import { getRecipes, type Meal } from '../../lib/recipes';
import { getMyRecipes } from '../../lib/storage';

import { auth } from '../../lib/firebase';

const FILTER_REVEAL_OFFSET = 190;
const FILTER_REVEAL_DISTANCE = 120;
const SCROLL_DIRECTION_THRESHOLD = 1;

export default function HomeScreen() {
  const router = useRouter();

  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);
  const [floatingFiltersInteractive, setFloatingFiltersInteractive] = useState(false);
  const listRef = useRef<FlatList<Meal>>(null);
  const lastScrollOffset = useRef(0);
  const filterRevealProgress = useRef(new Animated.Value(0)).current;
  const filterRevealProgressValue = useRef(0);
  const headingProgress = useRef(new Animated.Value(1)).current;
  const headingCollapsed = useRef(false);
  const headingHeightMeasured = useRef(false);
  const keyboardVisible = useRef(false);
  const [headingHeight, setHeadingHeight] = useState(0);

  useScrollToTop(listRef);

  function animateHeading(collapsed: boolean, duration = 240) {
    if (headingCollapsed.current === collapsed) {
      return;
    }

    headingCollapsed.current = collapsed;
    headingProgress.stopAnimation();
    Animated.timing(headingProgress, {
      toValue: collapsed ? 0 : 1,
      duration: duration > 0 ? duration : 240,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      keyboardVisible.current = true;
      animateHeading(true, event.duration);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      keyboardVisible.current = false;
      animateHeading(false, event.duration);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRecipes() {
      setLoading(true);
      setError('');

      try {
        const allRecipes = await getRecipes();
        const myRecipes = auth.currentUser
          ? await getMyRecipes(auth.currentUser.uid)
          : [];

        const combinedRecipes = [
          ...myRecipes.map((recipe) => ({ ...recipe, source: 'user' as const })),
          ...allRecipes,
        ];

        if (active) {
          setRecipes(combinedRecipes);
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

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.strMeal.toLowerCase().includes(search.toLowerCase());

    const matchesSource =
      selectedSource === 'Todas' ||
      (selectedSource === 'API' && recipe.source === 'api') ||
      (selectedSource === 'Minhas receitas' && recipe.source === 'user');

    const matchesCategory =
      selectedCategory === 'Todas' || recipe.strCategory === selectedCategory;

    return matchesSearch && matchesSource && matchesCategory;
  });

  const visibleRecipes = filteredRecipes.slice(0, visibleCount);

  function loadMoreRecipes() {
    if (visibleCount < filteredRecipes.length) {
      setVisibleCount((current) =>
        Math.min(current + 10, filteredRecipes.length)
      );
    }
  }

  function selectSource(source: string) {
    setSelectedSource(source);
    setVisibleCount(10);
    filterRevealProgressValue.current = 0;
    filterRevealProgress.setValue(0);
    setFloatingFiltersInteractive(false);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function selectCategory(category: string) {
    setSelectedCategory(category);
    setVisibleCount(10);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function renderFilters(floating = false) {
    return (
      <View style={[styles.filters, floating && styles.floatingFilterRow]}>
        {['Todas', 'API', 'Minhas receitas'].map((source) => (
          <Pressable
            key={source}
            style={[
              styles.filterButton,
              selectedSource === source && styles.filterButtonActive,
            ]}
            onPress={() => selectSource(source)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedSource === source && styles.filterButtonTextActive,
              ]}
            >
              {source}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderCategoryFilters() {
    const categories = [
      'Todas',
      'Sobremesa',
      'Almoço',
      'Jantar',
      'Café da manhã',
      'Lanche',
      'Bebida',
      'Frutos do mar',
      'Vegetariano',
      'Frango',
      'Massas',
      'Carne bovina',
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => selectCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        onLayout={(event) => {
          if (!headingHeightMeasured.current) {
            headingHeightMeasured.current = true;
            setHeadingHeight(event.nativeEvent.layout.height);
          }
        }}
        style={[
          styles.headingContainer,
          {
            height: headingHeight > 0
              ? headingProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, headingHeight],
              })
              : undefined,
            opacity: headingProgress,
            transform: [
              {
                translateY: headingProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headingContent}>
          <Text style={styles.eyebrow}>SUA COZINHA</Text>
          <Text style={styles.title}>Receitas</Text>
          <Text style={styles.subtitle}>
            Encontre algo delicioso para preparar hoje
          </Text>
        </View>
      </Animated.View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#B85C38"
          style={styles.loader}
        />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            data={visibleRecipes}
            ListHeaderComponent={
              <View>
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color="#8B8179"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.search}
                    placeholder="Buscar uma receita..."
                    placeholderTextColor="#8B8179"
                    returnKeyType="search"
                    value={search}
                    onFocus={() => {
                      if (Platform.OS === 'android' && !keyboardVisible.current) {
                        animateHeading(true);
                      }
                    }}
                    onBlur={() => {
                      if (!keyboardVisible.current) {
                        animateHeading(false);
                      }
                    }}
                    onChangeText={(value) => {
                      setSearch(value);
                      setVisibleCount(10);
                    }}
                  />
                </View>

                {renderFilters()}

                {renderCategoryFilters()}

                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>Receitas para explorar</Text>
                  <Text style={styles.resultsCount}>
                    {filteredRecipes.length === 1
                      ? '1 receita'
                      : `${filteredRecipes.length} receitas`}
                  </Text>
                </View>
              </View>
            }
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
            onScroll={(event) => {
              const offset = event.nativeEvent.contentOffset.y;
              const scrollDelta = offset - lastScrollOffset.current;
              let progress = filterRevealProgressValue.current;

              if (offset <= FILTER_REVEAL_OFFSET) {
                progress = 0;
              } else if (scrollDelta < -SCROLL_DIRECTION_THRESHOLD) {
                progress = Math.min(
                  1,
                  progress + -scrollDelta / FILTER_REVEAL_DISTANCE
                );
              } else if (scrollDelta > SCROLL_DIRECTION_THRESHOLD) {
                progress = Math.max(
                  0,
                  progress - scrollDelta / FILTER_REVEAL_DISTANCE
                );
              }

              filterRevealProgressValue.current = progress;
              filterRevealProgress.setValue(progress);
              const isInteractive = progress > 0.05;
              if (isInteractive !== floatingFiltersInteractive) {
                setFloatingFiltersInteractive(isInteractive);
              }
              lastScrollOffset.current = offset;
            }}
            scrollEventThrottle={16}
            onEndReached={loadMoreRecipes}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search-outline" size={42} color="#B85C38" />
                </View>

                <Text style={styles.emptyTitle}>
                  Nenhuma receita encontrada
                </Text>

                <Text style={styles.emptyDescription}>
                  Não encontramos receitas com esse nome. Tente buscar por outro termo.
                </Text>

                <Pressable style={styles.clearButton} onPress={() => setSearch('')}>
                  <Text style={styles.clearButtonText}>Limpar pesquisa</Text>
                </Pressable>
              </View>
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
          <Animated.View
            pointerEvents={floatingFiltersInteractive ? 'auto' : 'none'}
            style={[
              styles.floatingFilters,
              {
                opacity: filterRevealProgress,
                transform: [
                  {
                    translateY: filterRevealProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {renderFilters(true)}
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    paddingTop: 12,
    paddingHorizontal: 20,
  },

  headingContainer: {
    overflow: 'hidden',
  },

  headingContent: {
    paddingTop: 38,
  },

  eyebrow: {
    color: '#B85C38',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  title: {
    color: '#34251F',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 3,
  },

  subtitle: {
    color: '#776A60',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },

  listContainer: {
    flex: 1,
    position: 'relative',
  },

  floatingFilters: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },

  floatingFilterRow: {
    marginTop: 4,
    marginBottom: 4,
    padding: 5,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E8DCCF',
    backgroundColor: '#FFF9F2',
    shadowColor: '#34251F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DCCF',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
    marginTop: 2,
    marginBottom: 10,
    shadowColor: '#34251F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  searchIcon: {
    marginRight: 10,
  },

  search: {
    flex: 1,
    paddingVertical: 12,
    color: '#34251F',
    fontSize: 15,
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },

  resultsTitle: {
    color: '#34251F',
    fontSize: 17,
    fontWeight: '800',
  },

  resultsCount: {
    color: '#8B8179',
    fontSize: 12,
    fontWeight: '600',
  },

  list: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  loader: {
    marginTop: 40,
  },

  message: {
    color: '#776A60',
    textAlign: 'center',
    marginTop: 30,
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

  clearButton: {
    backgroundColor: '#B85C38',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 22,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#F1E8DF',
  },

  filterButtonActive: {
    backgroundColor: '#B85C38',
  },

  filterButtonText: {
    color: '#6F6259',
    fontSize: 13,
    fontWeight: '600',
  },

  categoryFilters: {
    marginTop: 6,
    marginBottom: 2,
  },

  categoryButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1EAE4',
    marginRight: 8,
  },

  categoryButtonActive: {
    backgroundColor: '#B85C38',
  },

  categoryButtonText: {
    color: '#6B5B50',
    fontSize: 13,
    fontWeight: '500',
  },

  categoryButtonTextActive: {
    color: '#FFFFFF',
  },

  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});

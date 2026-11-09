import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../lib/firebase';
import { getMyRecipes } from '../lib/storage';
import { getPublicRecipes } from '../lib/community';
import RecipeCard from '../components/RecipeCard';
import type { Meal } from '../lib/recipes';

export default function MyRecipesScreen() {
    const router = useRouter();

    const [recipes, setRecipes] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');

    const filteredRecipes = recipes.filter((recipe) =>
        recipe.strMeal.toLowerCase().includes(search.toLowerCase())
    );

    useFocusEffect(
        useCallback(() => {
            async function loadRecipes() {
                setLoading(true);
                setLoadError('');

                try {
                    const userId = auth.currentUser?.uid;

                    if (!userId) {
                        setRecipes([]);
                        return;
                    }

                    const [myRecipes, publicRecipes] = await Promise.all([
                        getMyRecipes(userId),
                        getPublicRecipes(),
                    ]);
                    setRecipes([
                        ...myRecipes,
                        ...publicRecipes
                            .filter((recipe) => recipe.createdBy === userId)
                            .map((recipe) => ({
                                ...recipe,
                                source: 'community' as const,
                            })),
                    ]);
                } catch {
                    setRecipes([]);
                    setLoadError('Não foi possível carregar suas receitas. Tente novamente mais tarde.');
                } finally {
                    setLoading(false);
                }
            }

            loadRecipes();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={23} color="#34251F" />
                <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>

            <Text style={styles.eyebrow}>SUA COZINHA</Text>
            <Text style={styles.title}>Minhas receitas</Text>
            <Text style={styles.subtitle}>
                Todas as receitas que você criou
            </Text>

            <Pressable
                style={styles.addButton}
                onPress={() => router.push('/(tabs)/new_recipe')}
            >
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Adicionar receita</Text>
            </Pressable>

            <TextInput
                style={styles.search}
                placeholder="Buscar uma receita..."
                placeholderTextColor="#8B8179"
                value={search}
                onChangeText={setSearch}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#B85C38" style={styles.loader} />
            ) : loadError ? (
                <Text style={styles.loadError}>{loadError}</Text>
            ) : (
                <FlatList
                    data={filteredRecipes}
                    keyExtractor={(item) => item.idMeal}
                    renderItem={({ item }) => (
                        <RecipeCard
                            meal={item}
                            onPress={() => {
                                router.push({
                                    pathname: '/recipe/[id]',
                                    params: {
                                        id: item.idMeal,
                                        source: item.source,
                                    },
                                });
                            }}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons
                                    name={search.trim() ? "search-outline" : "restaurant-outline"}
                                    size={42}
                                    color="#B85C38"
                                />
                            </View>

                            <Text style={styles.emptyTitle}>
                                {search.trim()
                                    ? 'Nenhuma receita encontrada'
                                    : 'Você ainda não criou receitas'}
                            </Text>

                            <Text style={styles.emptyDescription}>
                                {search.trim()
                                    ? 'Não encontramos receitas com esse nome. Tente buscar por outro termo.'
                                    : 'Suas receitas pessoais e publicadas na comunidade aparecerão aqui.'}
                            </Text>

                            {!search.trim() && (
                                <Text style={styles.emptyHint}>
                                    Acesse a opção Nova receita para começar!
                                </Text>
                            )}
                        </View>
                    }
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
        fontSize: 30,
        fontWeight: '800',
        marginTop: 5,
    },

    subtitle: {
        color: '#776A60',
        fontSize: 15,
        marginTop: 5,
        marginBottom: 24,
    },

    list: {
        paddingBottom: 30,
        flexGrow: 1,
    },

    loader: {
        marginTop: 40,
    },

    loadError: {
        color: '#B00020',
        textAlign: 'center',
        marginTop: 40,
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingTop: 80,
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

    emptyHint: {
        color: '#B85C38',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 18,
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },

    backButtonText: {
        color: '#34251F',
        fontSize: 15,
        fontWeight: '600',
    },

    addButton: {
        backgroundColor: '#B85C38',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 22,
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
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
});

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, ScrollView, StyleSheet, Text, Pressable, View, Modal, } from 'react-native';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown, } from 'react-native-reanimated';

import { getIngredients, getRecipeById, type Meal, } from '../../../lib/recipes';

import { getFavorites, toggleFavorite, getCustomRecipes, deleteCustomRecipe, } from '../../../lib/storage';

import { auth } from '../../../lib/firebase';
import {
  deletePublicRecipe,
  getPublicRecipeById,
} from '../../../lib/community';

type RecipeDialog = {
  title: string;
  message: string;
  icon: 'alert-circle-outline' | 'trash-outline' | 'close-circle-outline';
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
};

export default function RecipeDetailsScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dialog, setDialog] = useState<RecipeDialog | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  const goToHome = useCallback(() => {
    router.replace('/');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goToHome();
          return true;
        }
      );

      return () => subscription.remove();
    }, [goToHome])
  );

  useEffect(() => {
    let active = true;

    async function loadMeal() {
      try {
        setLoading(true);
        setError('');
        setCheckedIngredients([]);

        if (!id) {
          throw new Error('ID da receita não encontrado');
        }

        let result: Meal | undefined;

        if (id.startsWith('local_')) {
          const customRecipes = await getCustomRecipes();

          result = customRecipes.find(
            (recipe: Meal) => recipe.idMeal === id
          );
        } else if (source === 'community') {
          result = await getPublicRecipeById(id);
        } else {
          try {
            result = await getRecipeById(id);
          } catch {
            // Fall back to Firestore for community recipes.
          }

          if (!result) {
            result = await getPublicRecipeById(id);
          }
        }

        if (!result) {
        throw new Error('Receita não encontrada');
      }

      let isFavorite = false;

      if (auth.currentUser) {
        const favorites = await getFavorites();
        isFavorite = favorites.includes(id);
      }

      if (active) {
        setMeal(result);
        setFavorite(isFavorite);
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

  if (!auth.currentUser) {
    setShowLoginModal(true);
    return;
  }

  try {
    const updated = await toggleFavorite(id);
    setFavorite(updated.includes(id));
  } catch {
    setError('Não foi possível atualizar os favoritos.');
  }
}

function handleDeleteRecipe() {
  const userId = auth.currentUser?.uid;
  const isPublicRecipe = source === 'community' || meal?.isPublic === true;

  if (
    !id ||
    !userId ||
    meal?.createdBy !== userId ||
    (!id.startsWith('local_') && !isPublicRecipe)
  ) {
    setDialog({
      title: 'Ação não permitida',
      message: 'Você só pode excluir receitas criadas por você.',
      icon: 'alert-circle-outline',
    });
    return;
  }

  setDialog({
    title: 'Excluir receita?',
    message: 'Esta ação não pode ser desfeita. Tem certeza de que deseja excluir esta receita?',
    icon: 'trash-outline',
    confirmLabel: 'Excluir receita',
    destructive: true,
    onConfirm: async () => {
      setDialog(null);
      setDeleting(true);

      try {
        if (isPublicRecipe) {
          await deletePublicRecipe(id, userId);
        } else {
          await deleteCustomRecipe(id, userId);
        }
        router.replace('/(tabs)');
      } catch {
        setDialog({
          title: 'Não foi possível excluir',
          message: 'Verifique sua conexão e se a receita ainda pertence à sua conta, depois tente novamente.',
          icon: 'close-circle-outline',
        });
      } finally {
        setDeleting(false);
      }
    },
  });
}

function handleEditRecipe() {
  const userId = auth.currentUser?.uid;
  const isPublicRecipe = source === 'community' || meal?.isPublic === true;

  if (
    !id ||
    !userId ||
    meal?.createdBy !== userId ||
    (!id.startsWith('local_') && !isPublicRecipe)
  ) {
    setDialog({
      title: 'Ação não permitida',
      message: 'Você só pode editar receitas criadas por você.',
      icon: 'alert-circle-outline',
    });
    return;
  }

  router.push({
    pathname: '/(tabs)/new_recipe',
    params: {
      editId: id,
      editSource: isPublicRecipe ? 'community' : 'local',
      editSession: Date.now().toString(),
    },
  });
}

function toggleIngredient(index: number) {
  setCheckedIngredients((current) =>
    current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]
  );
}

if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#B85C38" />
      <Text style={styles.loadingText}>Preparando a receita...</Text>
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

const instructions = (meal.strInstructions || '')
  .replace(/\b(?:step|passo)\s*\d+\s*[:.)-]?\s*/gi, '')
  .split(/\r?\n/)
  .map((step) =>
    step.replace(/^\s*\d+\s*[.)-]\s*/, '').trim()
  )
  .filter(Boolean);
const isOwner =
  Boolean(auth.currentUser?.uid) &&
  meal.createdBy === auth.currentUser?.uid &&
  (Boolean(id?.startsWith('local_')) ||
    source === 'community' ||
    meal.isPublic === true);

return (
  <>
    <Animated.ScrollView
      entering={FadeInDown.duration(260)}
      exiting={FadeOutDown.duration(220)}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        onPress={goToHome}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Voltar para o início"
      >
        <Ionicons name="chevron-back" size={24} color="#34251F" />
      </Pressable>

      <Image
        source={{ uri: meal.strMealThumb }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.metadata}>
          <Text style={styles.category}>
            {meal.strCategory || 'Receita'}
          </Text>

          {meal.strArea ? (
            <Text style={styles.area}>
              {meal.strArea}
            </Text>
          ) : null}
        </View>

        <Text style={styles.title}>
          {meal.strMeal}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.favoriteButton,
            pressed && styles.favoriteButtonPressed,
          ]}
          onPress={handleFavorite}
        >
          <Text style={styles.favoriteIcon}>
            {favorite ? '♥' : '♡'}
          </Text>

          <Text style={styles.favoriteText}>
            {favorite
              ? 'Remover dos favoritos'
              : 'Adicionar aos favoritos'}
          </Text>
        </Pressable>

        {isOwner ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
              onPress={handleEditRecipe}
              accessibilityRole="button"
              accessibilityLabel="Editar minha receita"
            >
              <Ionicons name="create-outline" size={19} color="#8D432B" />
              <Text style={styles.editButtonText}>Editar minha receita</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
                deleting && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteRecipe}
              disabled={deleting}
              accessibilityRole="button"
              accessibilityLabel="Excluir minha receita"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#A33131" />
              ) : (
                <Ionicons name="trash-outline" size={19} color="#A33131" />
              )}
              <Text style={styles.deleteButtonText}>
                {deleting ? 'Excluindo...' : 'Excluir minha receita'}
              </Text>
            </Pressable>
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.heading}>Ingredientes</Text>

          <Text style={styles.progress}>
            {checkedIngredients.length}/{ingredients.length}
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          Marque os ingredientes conforme for separando.
        </Text>

        {ingredients.length > 0 ? (
          <View style={styles.ingredientList}>
            {ingredients.map((ingredient, index) => {
              const checked = checkedIngredients.includes(index);

              return (
                <Pressable
                  key={`${index}-${ingredient}`}
                  style={styles.ingredientRow}
                  onPress={() => toggleIngredient(index)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                    ]}
                  >
                    {checked ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.ingredient,
                      checked && styles.ingredientChecked,
                    ]}
                  >
                    {ingredient}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={styles.body}>
            Ingredientes não informados.
          </Text>
        )}

        <Text style={styles.heading}>Modo de preparo</Text>

        <Text style={styles.sectionDescription}>
          Siga as etapas para preparar sua receita.
        </Text>

        {instructions.length > 0 ? (
          <View style={styles.stepsList}>
            {instructions.map((step, index) => (
              <View
                key={`${index}-${step}`}
                style={styles.stepRow}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <Text style={styles.stepText}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.body}>
            Modo de preparo não informado.
          </Text>
        )}
      </View>
    </Animated.ScrollView>

    <Modal
      visible={showLoginModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLoginModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalEmoji}>❤️</Text>

          <Text style={styles.modalTitle}>
            Entre para salvar suas receitas!
          </Text>

          <Text style={styles.modalDescription}>
            Faça login ou crie uma conta para guardar suas receitas favoritas e acessá-las quando quiser.
          </Text>

          <Pressable
            style={styles.modalLoginButton}
            onPress={() => {
              setShowLoginModal(false);
              router.push('/login');
            }}
          >
            <Text style={styles.modalLoginText}>
              Entrar na minha conta
            </Text>
          </Pressable>

          <Pressable
            style={styles.modalRegisterButton}
            onPress={() => {
              setShowLoginModal(false);
              router.push('/register');
            }}
          >
            <Text style={styles.modalRegisterText}>
              Criar uma conta
            </Text>
          </Pressable>

          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setShowLoginModal(false)}
          >
            <Text style={styles.modalCloseText}>
              Agora não
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>

    <Modal
      visible={dialog !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setDialog(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[
            styles.dialogIconContainer,
            dialog?.destructive && styles.dialogIconContainerDestructive,
          ]}>
            <Ionicons
              name={dialog?.icon ?? 'alert-circle-outline'}
              size={34}
              color={dialog?.destructive ? '#A33131' : '#B85C38'}
            />
          </View>

          <Text style={styles.modalTitle}>{dialog?.title}</Text>
          <Text style={styles.modalDescription}>{dialog?.message}</Text>

          {dialog?.onConfirm ? (
            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelButton}
                onPress={() => setDialog(null)}
              >
                <Text style={styles.dialogCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dialogConfirmButton,
                  dialog.destructive && styles.dialogConfirmButtonDestructive,
                ]}
                onPress={() => {
                  void dialog.onConfirm?.();
                }}
              >
                <Text style={styles.dialogConfirmText}>
                  {dialog.confirmLabel ?? 'Confirmar'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.modalLoginButton}
              onPress={() => setDialog(null)}
            >
              <Text style={styles.modalLoginText}>Entendi</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  </>
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
  loadingText: {
    color: '#776A60',
    marginTop: 12,
    fontSize: 14,
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
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 1,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 249, 242, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  content: {
    padding: 22,
    paddingBottom: 50,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  category: {
    color: '#B85C38',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  area: {
    color: '#8B8179',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#34251F',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 20,
  },
  favoriteButton: {
    flexDirection: 'row',
    backgroundColor: '#F2E1D4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 9,
  },
  favoriteButtonPressed: {
    opacity: 0.75,
  },
  favoriteIcon: {
    color: '#8D432B',
    fontSize: 21,
    fontWeight: '700',
  },
  favoriteText: {
    color: '#8D432B',
    fontWeight: '700',
    fontSize: 14,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#F2E1D4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    marginBottom: 16,
    gap: 9,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    color: '#8D432B',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF1EF',
    borderWidth: 1,
    borderColor: '#F0D0CC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 28,
    gap: 9,
  },
  deleteButtonPressed: {
    opacity: 0.75,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#A33131',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    color: '#34251F',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  progress: {
    color: '#B85C38',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
  },
  sectionDescription: {
    color: '#8B8179',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  ingredientList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E8DCCF',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F2EAE2',
    gap: 12,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderWidth: 1.5,
    borderColor: '#C9B8AA',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#B85C38',
    borderColor: '#B85C38',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  ingredient: {
    flex: 1,
    color: '#594B42',
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientChecked: {
    color: '#A49A92',
    textDecorationLine: 'line-through',
  },
  stepsList: {
    gap: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2E1D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#B85C38',
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: '#594B42',
    fontSize: 15,
    lineHeight: 24,
    paddingTop: 2,
  },
  body: {
    color: '#594B42',
    fontSize: 15,
    lineHeight: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  modalTitle: {
    color: '#34251F',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    color: '#8B8179',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5E5DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogIconContainerDestructive: {
    backgroundColor: '#FBE9E7',
  },
  dialogActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  dialogCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8DCCF',
    backgroundColor: '#FFF9F2',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  dialogCancelText: {
    color: '#776A60',
    fontSize: 15,
    fontWeight: '700',
  },
  dialogConfirmButton: {
    flex: 1,
    backgroundColor: '#B85C38',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  dialogConfirmButtonDestructive: {
    backgroundColor: '#A33131',
  },
  dialogConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalLoginButton: {
    width: '100%',
    backgroundColor: '#B85C38',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalLoginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalRegisterButton: {
    width: '100%',
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#E8DCCF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  modalRegisterText: {
    color: '#B85C38',
    fontSize: 15,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 12,
    marginTop: 8,
  },
  modalCloseText: {
    color: '#8B8179',
    fontSize: 14,
    fontWeight: '600',
  },
});

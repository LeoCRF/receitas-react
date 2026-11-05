
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../lib/firebase';

import { getCustomRecipes, saveCustomRecipe, updateCustomRecipe } from '../../lib/storage';

export default function NewRecipeScreen() {
  const router = useRouter();
  const { editId, editSession } = useLocalSearchParams<{
    editId?: string;
    editSession?: string;
  }>();
  const editIdRef = useRef(editId);
  editIdRef.current = editId;

  const [headerHeight, setHeaderHeight] = useState(0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instruction, setInstruction] = useState('');
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(Boolean(editId));
  const [saving, setSaving] = useState(false);
  const [categories] = useState([
    'Café da manhã',
    'Almoço',
    'Jantar',
    'Sobremesa',
    'Lanche',
    'Bebida',
  ]);
  const headerProgress = useRef(new Animated.Value(1)).current;
  const headerCollapsed = useRef(false);
  const headerHeightMeasured = useRef(false);
  const keyboardVisible = useRef(false);

  useFocusEffect(
    useCallback(
      () => () => {
        if (!editIdRef.current) {
          return;
        }

        editIdRef.current = undefined;
        setName('');
        setCategory('');
        setImage('');
        setIngredients('');
        setInstruction('');
        setEditingRecipeId(null);
        setLoadingRecipe(false);
        router.setParams({ editId: undefined, editSession: undefined });
      },
      [router]
    )
  );

  useEffect(() => {
    let active = true;

    async function loadRecipeForEditing() {
      if (!editId) {
        setLoadingRecipe(false);
        return;
      }

      setLoadingRecipe(true);
      const userId = auth.currentUser?.uid;

      try {
        if (!editId.startsWith('local_') || !userId) {
          throw new Error('Você não tem permissão para editar esta receita.');
        }

        const recipes = await getCustomRecipes();
        const recipe = recipes.find((item) => item.idMeal === editId);

        if (!recipe || recipe.createdBy !== userId) {
          throw new Error('Você só pode editar receitas criadas por você.');
        }

        const recipeIngredients = Object.keys(recipe)
          .filter((key) => /^strIngredient\d+$/.test(key))
          .sort((a, b) => Number(a.replace('strIngredient', '')) - Number(b.replace('strIngredient', '')))
          .map((key) => recipe[key])
          .filter((ingredient) => typeof ingredient === 'string' && ingredient.trim());

        if (active) {
          setName(recipe.strMeal ?? '');
          setCategory(recipe.strCategory ?? '');
          setImage(recipe.strMealThumb ?? '');
          setIngredients(recipeIngredients.join('\n'));
          setInstruction(recipe.strInstructions ?? '');
          setEditingRecipeId(editId);
        }
      } catch {
        if (active) {
          Alert.alert(
            'Não foi possível editar',
            'Esta receita não existe ou você não tem permissão para editá-la.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
          );
        }
      } finally {
        if (active) {
          setLoadingRecipe(false);
        }
      }
    }

    loadRecipeForEditing();

    return () => {
      active = false;
    };
  }, [editId, editSession, router]);

  function animateHeader(collapsed: boolean, duration = 240) {
    if (headerCollapsed.current === collapsed) {
      return;
    }

    headerCollapsed.current = collapsed;
    headerProgress.stopAnimation();
    Animated.timing(headerProgress, {
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
      animateHeader(true, event.duration);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      keyboardVisible.current = false;
      animateHeader(false, event.duration);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function handleInputFocus() {
    if (Platform.OS === 'android' && !keyboardVisible.current) {
      animateHeader(true);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    if (!name.trim() || !ingredients.trim() || !instruction.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha o nome, os ingredientes e o modo de preparo.'
      );
      return;
    }

    const ingredientsList = ingredients
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert('Entre na sua conta', 'Faça login para salvar sua receita.');
      return;
    }

    const recipe = {
      strMeal: name.trim(),
      strCategory: category.trim() || 'Minha receita',
      strMealThumb:
        image.trim() ||
        'https://placehold.co/600x400/F2E1D4/34251F?text=Minha+receita',
      strInstructions: instruction.trim(),
      ...Object.fromEntries(
        ingredientsList.slice(0, 20).map((item, index) => [
          `strIngredient${index + 1}`,
          item,
        ])
      ),
    };

    try {
      setSaving(true);
      if (editingRecipeId) {
        await updateCustomRecipe(editingRecipeId, userId, recipe);
      } else {
        await saveCustomRecipe({
          ...recipe,
          idMeal: `local_${Date.now()}`,
          createdBy: userId,
        });
      }

      Alert.alert(
        editingRecipeId ? 'Receita atualizada' : 'Receita salva',
        editingRecipeId ? 'As alterações foram salvas!' : 'Sua receita foi adicionada!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch {
      Alert.alert(
        'Erro',
        editingRecipeId
          ? 'Não foi possível atualizar a receita. Verifique se ela ainda pertence à sua conta e tente novamente.'
          : 'Não foi possível salvar a receita.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingRecipe) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#B85C38" />
        <Text style={styles.loadingText}>Carregando sua receita...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#34251F" />
          </Pressable>

          <Animated.View
            onLayout={(event) => {
              if (!headerHeightMeasured.current) {
                headerHeightMeasured.current = true;
                setHeaderHeight(event.nativeEvent.layout.height);
              }
            }}
            style={[
              styles.headerContent,
              {
                height: headerHeight > 0
                  ? headerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, headerHeight],
                    })
                  : undefined,
                opacity: headerProgress,
                transform: [
                  {
                    translateY: headerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.eyebrow}>SUA COZINHA</Text>

            <Text style={styles.title}>
              {editingRecipeId ? 'Editar receita' : 'Nova receita'}
            </Text>

            <Text style={styles.subtitle}>
              {editingRecipeId
                ? 'Atualize os detalhes da sua receita'
                : 'Compartilhe um pouco do seu talento na cozinha'}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>01</Text>
          <View>
            <Text style={styles.sectionTitle}>Informações básicas</Text>
            <Text style={styles.sectionDescription}>
              Primeiro, conte um pouco sobre sua receita
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Nome da receita *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Bolo de cenoura"
          placeholderTextColor="#8B8179"
          onFocus={handleInputFocus}
        />

        <Text style={styles.label}>Categoria</Text>

        <View style={styles.categoryContainer}>
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Foto da receita (opcional)</Text>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={34} color="#B85C38" />
              <Text style={styles.imagePickerTitle}>Adicionar uma foto</Text>
              <Text style={styles.imagePickerDescription}>
                Escolha uma imagem da galeria
              </Text>
            </View>
          )}
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>02</Text>
          <View>
            <Text style={styles.sectionTitle}>Ingredientes e preparo</Text>
            <Text style={styles.sectionDescription}>
              Agora vamos aos detalhes da receita
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Ingredientes * (um por linha)</Text>
        <TextInput
          style={[styles.input, styles.multiline, styles.ingredientsInput]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={'2 ovos\n1 xícara de açúcar\n2 xícaras de farinha'}
          placeholderTextColor="#8B8179"
          multiline
          onFocus={handleInputFocus}
        />

        <Text style={styles.label}>Modo de preparo *</Text>
        <TextInput
          style={[styles.input, styles.multiline, styles.instructionInput]}
          value={instruction}
          onChangeText={setInstruction}
          placeholder="Escreva o passo a passo..."
          placeholderTextColor="#8B8179"
          multiline
          onFocus={handleInputFocus}
        />

        <Pressable
          style={styles.button}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {saving
              ? 'Salvando...'
              : editingRecipeId
                ? 'Salvar alterações'
                : 'Salvar minha receita'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#776A60',
    marginTop: 12,
    fontSize: 14,
  },
  content: {
    padding: 22,
    paddingTop: 58,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 12,
  },
  headerContent: {
    overflow: 'hidden',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F2E8DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  eyebrow: {
    color: '#B85C38',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  title: {
    color: '#34251F',
    fontSize: 30,
    fontWeight: '800',
  },

  subtitle: {
    color: '#776A60',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },

  label: {
    color: '#34251F',
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8DCCF',
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    color: '#34251F',
    fontSize: 15,
  },

  multiline: {
    textAlignVertical: 'top',
    lineHeight: 22,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },

  sectionNumber: {
    color: '#B85C38',
    fontSize: 18,
    fontWeight: '800',
  },

  sectionTitle: {
    color: '#34251F',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionDescription: {
    color: '#776A60',
    fontSize: 12,
    marginTop: 3,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8DCCF',
    backgroundColor: '#FFFFFF',
  },

  categoryButtonActive: {
    backgroundColor: '#B85C38',
    borderColor: '#B85C38',
  },

  categoryText: {
    color: '#776A60',
    fontSize: 13,
    fontWeight: '600',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  ingredientsInput: {
    minHeight: 150,
  },
  instructionInput: {
    minHeight: 190,
  },

  button: {
    backgroundColor: '#B85C38',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    marginBottom: 15,
    elevation: 2,
  },

  imagePicker: {
  height: 190,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#E8DCCF',
  borderStyle: 'dashed',
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
  marginBottom: 8,
},

imagePlaceholder: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
},

imagePickerTitle: {
  color: '#34251F',
  fontSize: 15,
  fontWeight: '700',
},

imagePickerDescription: {
  color: '#8B8179',
  fontSize: 12,
},

imagePreview: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},
});

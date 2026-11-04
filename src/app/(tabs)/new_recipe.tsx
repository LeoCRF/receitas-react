
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../lib/firebase';

import { saveCustomRecipe } from '../../lib/storage';

export default function NewRecipeScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instruction, setInstruction] = useState('');
  const [categories] = useState([
    'Café da manhã',
    'Almoço',
    'Jantar',
    'Sobremesa',
    'Lanche',
    'Bebida',
  ]);

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

    const recipe = {
      idMeal: `local_${Date.now()}`,
      createdBy: auth.currentUser?.uid,
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
      await saveCustomRecipe(recipe);

      Alert.alert('Receita salva', 'Sua receita foi adicionada!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a receita.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#34251F" />
          </Pressable>

          <Text style={styles.eyebrow}>SUA COZINHA</Text>

          <Text style={styles.title}>Nova receita</Text>

          <Text style={styles.subtitle}>
            Compartilhe um pouco do seu talento na cozinha
          </Text>
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
        />

        <Text style={styles.label}>Modo de preparo *</Text>
        <TextInput
          style={[styles.input, styles.multiline, styles.instructionInput]}
          value={instruction}
          onChangeText={setInstruction}
          placeholder="Escreva o passo a passo..."
          placeholderTextColor="#8B8179"
          multiline
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Salvar minha receita</Text>
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
  content: {
    padding: 22,
    paddingTop: 58,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 12,
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

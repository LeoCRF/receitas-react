import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, Pressable, } from 'react-native';
import { useRouter } from 'expo-router';

import { saveCustomRecipe } from '../lib/storage';


export default function NewRecipeScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instruction, setInstruction] = useState('');

    async function handleSave() {
        if (
            !name.trim() ||
            !ingredients.trim() ||
            !instruction.trim()
        ) {
            Alert.alert(
                'Campos obrigatórios',
                'Preencha o nome, os ingredientes e o modo de preparo.'
            );
            return;
        }


        const ingredientsList = ingredients
        .split('/n')
        .map((item) => item.trim())
        .filter(Boolean);


        const recipe = {
            idMeal: `local_${Date.now()}`,
            strMeal: name.trim(),
            strCategory: category.trim() || 'Minha receita',
            strMealThumb:image.trim() || 'https://placehold.co/600x400/F2E1D4/34251F?text=Minha+receita',
            strInstruction: instruction.trim(),
            ...Object.fromEntries(
                ingredientsList.slice(0, 20).map((item, index) => [
                    `strIngredients${index +1}`,
                    item,
                ])
            ),
        };


        try {
            await saveCustomRecipe(recipe);

            Alert.alert('Receita salva', 'Sua receita foi adicionada!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/'),
                },
            ]);
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar a receita.');
        }
    }

    return (
        <KeyboardAvoidingView
        style={styles.container}
        >
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Nova receita</Text>
            <Text style={styles.subtitle}>Guarde suas próprias receitas no aplicativo</Text>
        
        <Text style={styles.label}>Nome da receita *</Text>
        <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder='Ex.: Bolo de cenoura'
            placeholderTextColor="#8B8179"
        />


            <Text style={styles.label}>Categoria</Text>
            <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Ex.: Sobremesa"
                placeholderTextColor="#8B8179"
            />


             <Text style={styles.label}>Link da foto (opcional)</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
          placeholder="https://..."
          placeholderTextColor="#8B8179"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Ingredientes * (um por linha)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder={'2 ovos\n1 xícara de açúcar\n2 xícaras de farinha'}
          placeholderTextColor="#8B8179"
          multiline
        />

        <Text style={styles.label}>Modo de preparo *</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={instruction}
          onChangeText={setInstruction}
          placeholder="Escreva o passo a passo..."
          placeholderTextColor="#8B8179"
          multiline
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar receita</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 22,
    paddingTop: 58,
    paddingBottom: 40,
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
    borderRadius: 12,
    padding: 13,
    color: '#34251F',
    fontSize: 15,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#B85C38',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
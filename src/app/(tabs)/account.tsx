
import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function navigateToFavorites() {
    router.navigate('/(tabs)/favorites');
  }

  function navigateToMyRecipes() {
    router.navigate('/my-recipes');
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      Alert.alert('Sucesso', 'Você saiu da sua conta');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair da conta');
    }
  }

  if (loading) {
    return <View style={styles.container} />;
  }

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#B85C38" />
          </View>

          <Text style={styles.title}>
            Olá, {user.displayName || 'usuário'}!
          </Text>
          <Text style={styles.subtitle}>
            Bem-vindo ao seu espaço no Receitas!
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>E-mail cadastrado</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <Pressable style={styles.menuButton} onPress={navigateToMyRecipes}>
          <View style={styles.menuIcon}>
            <Ionicons name="restaurant-outline" size={23} color="#B85C38" />
          </View>

          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Minhas receitas</Text>
            <Text style={styles.menuSubtitle}>Receitas que você criou</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#8B8179" />
        </Pressable>

        <Pressable style={styles.menuButton} onPress={navigateToFavorites}>
          <View style={styles.menuIcon}>
            <Ionicons name="heart-outline" size={23} color="#B85C38" />
          </View>

          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Meus favoritos</Text>
            <Text style={styles.menuSubtitle}>Receitas que você salvou</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#8B8179" />
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Sair da conta</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🍲</Text>
        <Text style={styles.title}>Faça parte do Receitas!</Text>
        <Text style={styles.subtitle}>
          Crie sua conta para salvar suas receitas favoritas e compartilhar
          suas próprias criações com outras pessoas.
        </Text>
      </View>

      <View style={styles.options}>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Ionicons name="log-in-outline" size={22} color="#FFFFFF" />
          <Text style={styles.loginButtonText}>Entrar na minha conta</Text>
        </Pressable>

        <Pressable
          style={styles.registerButton}
          onPress={() => router.push('/register')}
        >
          <Ionicons name="person-add-outline" size={22} color="#B85C38" />
          <Text style={styles.registerButtonText}>Criar uma conta</Text>
        </Pressable>
      </View>

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>Com uma conta você pode:</Text>

        <View style={styles.benefitItem}>
          <Ionicons name="heart-outline" size={20} color="#B85C38" />
          <Text style={styles.benefitText}>Salvar receitas favoritas</Text>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="restaurant-outline" size={20} color="#B85C38" />
          <Text style={styles.benefitText}>Publicar suas próprias receitas</Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#34251F',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8B8179',
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
  },
  options: {
    gap: 14,
  },
  loginButton: {
    backgroundColor: '#B85C38',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B85C38',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  registerButtonText: {
    color: '#B85C38',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefits: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 32,
    borderWidth: 1,
    borderColor: '#F0E5DA',
    gap: 14,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34251F',
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#8B8179',
    flex: 1,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0E5DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  info: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0E5DA',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#8B8179',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#34251F',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#B85C38',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  menuButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E5DA',
    marginBottom: 14,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5E5DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  menuText: {
    flex: 1,
    gap: 4,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34251F',
  },

  menuSubtitle: {
    fontSize: 13,
    color: '#8B8179',
  },
});


import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, router } from 'expo-router';
import { auth } from '../lib/firebase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  async function handleRegister() {
    setMessage('');

    if (!email.trim() || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('Preencha todos os campos para continuar');
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('A senha precisa ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('As senhas não coincidem');
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setMessageType('success');
      setMessage('Conta criada com sucesso! Redirecionando...');

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);

    } catch (error: any) {
      setMessageType('error');

      if (error.code === 'auth/email-already-in-use') {
        setMessage('Este e-mail já está cadastrado');
      } else if (error.code === 'auth/invalid-email') {
        setMessage('Digite um endereço de e-mail válido');
      } else if (error.code === 'auth/weak-password') {
        setMessage('A senha escolhida é muito fraca');
      } else if (error.code === 'auth/network-request-failed') {
        setMessage('Erro de conexão. Verifique sua internet');
      } else {
        setMessage('Não foi possível criar sua conta. Tente novamente');
      }

      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🍲</Text>
          <Text style={styles.title}>Receitas</Text>
          <Text style={styles.subtitle}>
            Faça parte da nossa comunidade
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>Criar conta</Text>
          <Text style={styles.description}>
            Preencha os dados para começar
          </Text>

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#A99B91"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha"
            placeholderTextColor="#A99B91"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#A99B91"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {message !== '' && (
            <View style={[
              styles.messageBox,
              messageType === 'success' ? styles.successBox : styles.errorBox
            ]}>
              <Text style={[
                styles.messageText,
                messageType === 'success' ? styles.successText : styles.errorText
              ]}>
                {message}
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Text>
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Já tem uma conta?{' '}
            </Text>
            <Link href="/login" style={styles.loginLink}>
              Entrar
            </Link>
          </View>
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 58,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#B85C38',
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8179',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F0E5DA',
  },
  heading: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#34251F',
  },
  description: {
    fontSize: 14,
    color: '#8B8179',
    marginTop: 6,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34251F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#E8DCCF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#34251F',
    marginBottom: 18,
  },
  messageBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: '#FDECEC',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#B3261E',
  },
  successText: {
    color: '#26733A',
  },
  button: {
    backgroundColor: '#B85C38',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 22,
  },
  loginText: {
    color: '#8B8179',
    fontSize: 14,
  },
  loginLink: {
    color: '#B85C38',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

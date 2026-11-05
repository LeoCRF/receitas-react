
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { Meal } from '../lib/recipes';

type Props = {
  meal: Meal;
  onPress: () => void;
};

export default function RecipeCard({ meal, onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 200,
    });
  }

  function handlePressOut() {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 180,
    });
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Image
          source={{ uri: meal.strMealThumb }}
          style={styles.image}
        />

        <View style={styles.info}>
          <Text style={styles.category} numberOfLines={1}>
            {meal.strCategory || 'Receita'}
          </Text>

          <Text style={styles.name} numberOfLines={2}>
            {meal.strMeal}
          </Text>

          <View style={styles.linkContainer}>
            <Text style={styles.link}>Ver receita</Text>
            <Ionicons name="arrow-forward" size={14} color="#B85C38" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E5DA',
    shadowColor: '#34251F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  image: {
    width: 112,
    height: 142,
    backgroundColor: '#EFE7DE',
  },

  info: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 5,
  },

  category: {
    color: '#B85C38',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  name: {
    color: '#34251F',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },

  link: {
    color: '#B85C38',
    fontSize: 13,
    fontWeight: '700',
  },

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
  },
});

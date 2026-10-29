import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Meal } from '../lib/recipes';


type Props = {
    meal: Meal;
    onPress: () => void;
};


export default function RecipeCard({ meal, onPress }: Props) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image 
            source={{ uri: meal.strMealThumb }}
            style={styles.image}
            />


            <View style={styles.info}>
                <Text style={styles.category}>
                    {meal.strCategory || 'Receita'}
                </Text>

                <Text style={styles.link}>Ver receita</Text>
            </View>
        </Pressable>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0E5DA',
    },

    
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#EFE7DE',
    },


    info: {
        padding: 14,
        gap: 6,
    },


    category: {
        color: '#B85C38',
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: '700',
    },


    name: {
        color: '#34251F',
        fontSize: 18,
        fontWeight: '700',
    },


    link: {
        color: '#B85C38',
        fontSize: 14,
        marginTop: 4,
    },
});
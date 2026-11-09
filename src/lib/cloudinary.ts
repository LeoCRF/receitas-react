import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

const CLOUDINARY_CLOUD_NAME = 'hkibmsh9';
const CLOUDINARY_UPLOAD_PRESET = 'receitas_app';

export async function uploadRecipeImage(uri: string, mimeType = 'image/jpeg', fileName = 'recipe.jpg'): Promise<string> {
    const formData = new FormData();
    const file = new File(uri);

    formData.append('file', file, fileName);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
        throw new Error(result.error?.message || 'Não foi possível enviar a imagem.');
    }

    return result.secure_url;
}
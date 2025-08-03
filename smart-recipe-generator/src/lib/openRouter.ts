import { getFoodImage } from './unsplash';

export async function generateImages(items: any[], userId: string): Promise<{ imgLink: string; name: string }[]> {
    return Promise.all(
        items.map(async ({ name, ingredients }) => {
            const imageUrl = await getFoodImage(name);
            return { imgLink: imageUrl, name };
        })
    );
}
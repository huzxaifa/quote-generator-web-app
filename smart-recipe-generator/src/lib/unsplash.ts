export async function getFoodImage(recipeName: string): Promise<string> {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipeName + ' food')}&per_page=1`,
            {
                headers: {
                    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                }
            }
        );

        const data = await response.json();
        return data.results[0]?.urls?.regular || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800';
    } catch (error) {
        console.error('Unsplash error:', error);
        return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800';
    }
}
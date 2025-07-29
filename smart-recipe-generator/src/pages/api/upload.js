import cloudinary from '../../lib/cloudinary';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const fileStr = req.body.data;

      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        folder: 'recipe_images',
      });

      res.status(200).json({ url: uploadedResponse.secure_url });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

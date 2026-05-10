import GalleryItem from '../models/GalleryItem.js';
import { getIO } from '../socket/index.js';

export const getGallery = async (req, res) => {
  try {
    const gallery = await GalleryItem.find();
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const item = new GalleryItem(req.body);
    const savedItem = await item.save();
    console.log(`[Gallery] ✅ Added item: "${savedItem.title || 'untitled'}" (${savedItem.category})`);
    getIO().emit('gallery_updated');
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    console.log(`[Gallery] 🗑️ Deleted gallery item ID: ${req.params.id}`);
    getIO().emit('gallery_updated');
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

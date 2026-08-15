import GalleryItem from '../models/GalleryItem.js';
import { getIO } from '../socket/index.js';

export const getGallery = async (req, res) => {
  try {
    const gallery = await GalleryItem.find().sort({ order: 1, createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    const count = await GalleryItem.countDocuments();
    const item = new GalleryItem({ ...req.body, order: count });
    const savedItem = await item.save();
    console.log(`[Gallery] ✅ Added item: "${savedItem.title || 'untitled'}" (${savedItem.category})`);
    getIO().emit('gallery_updated');
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    getIO().emit('gallery_updated');
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reorderGallery = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, index) => GalleryItem.findByIdAndUpdate(id, { order: index })));
    getIO().emit('gallery_updated');
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

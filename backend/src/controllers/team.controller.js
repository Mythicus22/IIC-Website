import TeamMember from '../models/TeamMember.js';
import { getIO } from '../socket/index.js';

export const getTeamMembers = async (req, res) => {
  try {
    const team = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const count = await TeamMember.countDocuments();
    const member = new TeamMember({ ...req.body, order: count });
    const savedMember = await member.save();
    console.log(`[Team] ✅ Added member: "${savedMember.name}" (${savedMember.category})`);
    getIO().emit('team_updated');
    res.status(201).json(savedMember);
  } catch (error) {
    console.error('[Team] ❌ Create error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log(`[Team] ✅ Updated member: "${updatedMember.name}"`);
    getIO().emit('team_updated');
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reorderTeam = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, index) => TeamMember.findByIdAndUpdate(id, { order: index })));
    getIO().emit('team_updated');
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    console.log(`[Team] 🗑️ Deleted member ID: ${req.params.id}`);
    getIO().emit('team_updated');
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

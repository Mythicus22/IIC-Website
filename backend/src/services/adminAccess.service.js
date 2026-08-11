import AdminAccess from '../models/AdminAccess.js';

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const getDefaultAdminEmails = () => (
  process.env.DEFAULT_ADMIN_EMAILS || ''
)
  .split(',')
  .map(normalizeEmail)
  .filter(Boolean);

export const isDefaultAdminEmail = (email) => (
  getDefaultAdminEmails().includes(normalizeEmail(email))
);

export const isAdminEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return false;
  if (isDefaultAdminEmail(normalizedEmail)) return true;

  const adminAccess = await AdminAccess.exists({ email: normalizedEmail });
  return Boolean(adminAccess);
};

export const grantAdminEmail = async (email, addedBy) => {
  const normalizedEmail = normalizeEmail(email);

  return AdminAccess.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, addedBy },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

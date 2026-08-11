const requiredProductionEnv = [
  'MONGO_URI',
  'CLIENT_URL',
  'JWT_SECRET',
  'DEFAULT_ADMIN_EMAILS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const requiredDevelopmentEnv = [
  'JWT_SECRET',
  'DEFAULT_ADMIN_EMAILS'
];

export const validateEnv = () => {
  const requiredVars = process.env.NODE_ENV === 'production'
    ? requiredProductionEnv
    : requiredDevelopmentEnv;
  const missingVars = requiredVars.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return process.env.JWT_SECRET;
};

import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with salt rounds.
 * 
 * @param password The raw password string
 * @returns The hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

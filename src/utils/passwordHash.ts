import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export async function encryptPassword(password: string): Promise<string> {
  //generate a salt
  const salt = randomBytes(8).toString('hex');
  //hash the salt & the password
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  //join the hashed result and the salt together
  const result = salt + '.' + hash.toString('hex');
  return result;
}

export async function decryptPassword(
  password: string,
  dbPassword: string,
): Promise<boolean> {
  const [salt, storedHash] = dbPassword.split('.');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return storedHash !== hash.toString('hex') ? false : true;
}

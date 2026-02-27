const crypto = require('crypto');

// O algoritmo AES-256-CBC precisa de uma chave de 32 bytes (256 bits) e um IV de 16 bytes.
// Em produção, essas chaves DEVEM vir de variáveis de ambiente.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32); 
const IV_LENGTH = 16; 

/**
 * Criptografa um texto (por exemplo, uma chave de API).
 * @param {string} text - O texto a ser criptografado.
 * @returns {string} O texto criptografado em formato hexadecimal, separado pelo IV com dois pontos.
 */
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Descriptografa um texto criptografado pela função `encrypt`.
 * @param {string} text - O texto criptografado no formato `iv:encryptedData`.
 * @returns {string} O texto original.
 */
function decrypt(text) {
  if (!text) return null;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };

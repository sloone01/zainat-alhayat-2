// Crypto polyfill for Node.js 16
import { randomBytes, randomUUID } from 'crypto';

// Add crypto to global if it doesn't exist
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array: any) => {
      const bytes = randomBytes(array.length);
      for (let i = 0; i < array.length; i++) {
        array[i] = bytes[i];
      }
      return array;
    },
    randomUUID: randomUUID
  } as any;
}


import { db } from './admin-config';

async function testConnection() {
  try {
    console.log('Attempting to connect to Firestore...');
    const collections = await db.listCollections();
    console.log('Successfully connected to Firestore!');
    console.log('Collections:', collections.map(col => col.id).join(', '));
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    process.exit(1);
  }
}

testConnection();

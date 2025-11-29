
import { db, app } from '../firebase/admin-config';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument.');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const user = await getAuth(app).getUserByEmail(email);
    await db.collection('roles_admin').doc(user.uid).set({
      email: user.email,
      role: 'super_admin',
      createdAt: new Date(),
    });
    console.log(`Successfully made ${email} an admin.`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

makeAdmin();

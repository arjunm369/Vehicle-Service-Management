import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-f3hP-4KaaipFyNJkVoI0BtL9Pe3FWlM",
  authDomain: "managevehicle-8245e-10753.firebaseapp.com",
  projectId: "managevehicle-8245e-10753",
  storageBucket: "managevehicle-8245e-10753.firebasestorage.app",
  messagingSenderId: "160017116560",
  appId: "1:160017116560:web:9fe0e896f3a5d396f8d715"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@vehicle.com";
const ADMIN_PASSWORD = "admin123";
const USER_EMAIL = "user@vehicle.com";
const USER_PASSWORD = "user123";

const spareParts = [
  { name: "Engine Oil Filter", category: "Filters", price: 350, stock: 50, description: "High-quality engine oil filter for optimal performance", createdAt: new Date().toISOString() },
  { name: "Brake Pads Set", category: "Brakes", price: 2500, stock: 30, description: "Premium brake pads for superior stopping power", createdAt: new Date().toISOString() },
  { name: "Air Filter", category: "Filters", price: 450, stock: 45, description: "Genuine air filter for better fuel efficiency", createdAt: new Date().toISOString() },
  { name: "Spark Plugs (Set of 4)", category: "Engine", price: 800, stock: 60, description: "High-performance spark plugs for smooth ignition", createdAt: new Date().toISOString() },
  { name: "Battery 12V 65Ah", category: "Electrical", price: 5500, stock: 20, description: "Long-lasting car battery with 3-year warranty", createdAt: new Date().toISOString() },
  { name: "Headlight Bulb H4", category: "Electrical", price: 250, stock: 100, description: "Bright halogen headlight bulb", createdAt: new Date().toISOString() },
  { name: "Windshield Wiper Blades", category: "Body", price: 600, stock: 40, description: "Pair of premium wiper blades", createdAt: new Date().toISOString() },
  { name: "Suspension Spring Set", category: "Suspension", price: 3500, stock: 15, description: "Heavy-duty suspension springs", createdAt: new Date().toISOString() },
  { name: "Brake Fluid DOT 4", category: "Brakes", price: 400, stock: 80, description: "High-quality brake fluid 1L", createdAt: new Date().toISOString() },
  { name: "Tire 195/65 R15", category: "Tires", price: 4500, stock: 25, description: "Premium tubeless tire with warranty", createdAt: new Date().toISOString() }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting Firebase seed...');

    // 1. Create admin user in Auth
    console.log('👤 Creating admin user...');
    try {
      await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('✅ Admin auth user created');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Admin user already exists');
      } else {
        throw error;
      }
    }

    // Sign in as admin to get UID
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const adminUid = userCred.user.uid;

    // 2. Create admin user document in Firestore
    console.log('📝 Creating admin user document...');
    await setDoc(doc(db, 'users', adminUid), {
      uid: adminUid,
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin',
      phone: '+91 9876543210',
      address: 'Admin Office',
      createdAt: new Date().toISOString()
    });
    console.log('✅ Admin user document created');

    // 3. Add spare parts
    console.log('🔧 Adding spare parts...');
    const partsSnap = await getDocs(collection(db, 'spareParts'));
    const existingNames = partsSnap.docs.map(d => d.data().name);
    let added = 0;
    for (const part of spareParts) {
      if (!existingNames.includes(part.name)) {
        await setDoc(doc(db, 'spareParts', part.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '')), part);
        console.log(`✅ Added: ${part.name}`);
        added++;
      }
    }
    if (added === 0) console.log('ℹ️  All spare parts already exist');
    else console.log(`✅ Added ${added} new parts`);

    // 4. Create empty collections (by adding placeholder docs)
    const collections = ['vehicles', 'bookings', 'orders'];
    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      if (snap.empty) {
        await setDoc(doc(db, col, '_placeholder'), { created: true });
        console.log(`✅ Created empty collection: ${col}`);
      }
    }

    // 5. Create demo user with a vehicle
    console.log('🚗 Creating demo user and vehicle...');
    let userUid;
    const usersSnap = await getDocs(collection(db, 'users'));
    const existingUser = usersSnap.docs.find(d => d.data().email === USER_EMAIL);
    
    if (existingUser) {
      userUid = existingUser.data().uid;
      console.log('ℹ️  Demo user found in Firestore, UID:', userUid);
    } else {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
        userUid = userCred.user.uid;
        console.log('✅ Demo user auth created, UID:', userUid);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('ℹ️  Demo user exists in Auth, need to get UID from Auth');
          // Sign in to get UID
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const userCred2 = await signInWithEmailAndPassword(auth, USER_EMAIL, USER_PASSWORD);
          userUid = userCred2.user.uid;
          console.log('✅ Got UID from Auth:', userUid);
        } else {
          throw error;
        }
      }
    }

    if (userUid) {
      // Update user document
      await setDoc(doc(db, 'users', userUid), {
        uid: userUid,
        email: USER_EMAIL,
        name: 'John Doe',
        role: 'user',
        phone: '+91 9876543210',
        address: '123 Main St, Mumbai, Maharashtra',
        createdAt: new Date().toISOString()
      });
      console.log('✅ User document synced');

      // Delete ALL vehicles and re-create fresh
      const vehSnap = await getDocs(collection(db, 'vehicles'));
      for (const d of vehSnap.docs) {
        await deleteDoc(doc(db, 'vehicles', d.id));
      }
      
      await setDoc(doc(db, 'vehicles', `vehicle-${userUid}`), {
        userId: userUid,
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        registrationNumber: 'MH-01-AB-1234',
        color: 'Silver',
        mileage: '45000',
        createdAt: new Date().toISOString()
      });
      console.log('✅ Vehicle created with correct UID');
    }

    console.log('\n🎉 Database seed complete!');
    console.log(`   Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`   User login: ${USER_EMAIL} / ${USER_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();

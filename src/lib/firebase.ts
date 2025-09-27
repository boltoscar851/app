import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || "AIzaSyBQYyDMShze4A4uFjlEbpqqaAkOTk4oqWE",
  authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || "nuestra-relacion.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || "nuestra-relacion",
  storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || "nuestra-relacion.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || "192379459077",
  appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID || "1:192379459077:android:88e13c3ec6e98174f36e6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Types
export interface User {
  id: string;
  email: string;
  display_name: string;
  couple_id?: string;
  avatar_url?: string;
  preferences?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Couple {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  special_code?: string;
}

export interface Message {
  id: string;
  couple_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'sticker' | 'voice';
  created_at: Date;
  sender_name?: string;
}

export interface DiaryEntry {
  id: string;
  couple_id: string;
  author_id: string;
  title: string;
  content: string;
  mood: string;
  photos: string[];
  created_at: Date;
  author_name?: string;
}

export interface Event {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  date: Date;
  type: 'anniversary' | 'date' | 'special' | 'reminder';
  created_by: string;
  created_at: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'romantic' | 'fun' | 'surprise' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  is_surprise: boolean;
  created_at: Date;
}

export interface CoupleActivity {
  id: string;
  couple_id: string;
  activity_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: Date;
  rating?: number;
  notes: string;
  created_at: Date;
  activity?: Activity;
}

export interface WeeklyChallenge {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  week_start: Date;
  status: 'active' | 'completed' | 'expired';
  completed_at?: Date;
  created_at: Date;
}

export interface WishlistItem {
  id: string;
  couple_id: string;
  title: string;
  description: string;
  category: 'travel' | 'experiences' | 'gifts' | 'goals' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_cost?: number;
  image_url?: string;
  is_completed: boolean;
  completed_at?: Date;
  added_by: string;
  created_at: Date;
}

// Firebase service functions
export const firebaseService = {
  // Authentication
  async signUpCouple(
    email1: string,
    password1: string,
    name1: string,
    email2: string,
    password2: string,
    name2: string,
    coupleName: string
  ) {
    try {
      // Create first user
      const userCredential1 = await createUserWithEmailAndPassword(auth, email1, password1);
      const user1 = userCredential1.user;

      // Create couple document
      const coupleRef = await addDoc(collection(db, 'couples'), {
        name: coupleName,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_active: true,
        special_code: null,
      });

      // Create user profile for first user
      await addDoc(collection(db, 'user_profiles'), {
        id: user1.uid,
        email: user1.email,
        display_name: name1,
        couple_id: coupleRef.id,
        avatar_url: null,
        preferences: {},
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Create couple member for first user
      await addDoc(collection(db, 'couple_members'), {
        couple_id: coupleRef.id,
        user_id: user1.uid,
        name: name1,
        role: 'partner_1',
        avatar_url: null,
        created_at: serverTimestamp(),
      });

      return {
        user1: userCredential1,
        couple: { id: coupleRef.id, name: coupleName },
        inviteCode: coupleRef.id,
      };
    } catch (error) {
      console.error('Error in signUpCouple:', error);
      throw error;
    }
  },

  async joinCouple(
    email: string,
    password: string,
    name: string,
    inviteCode: string
  ) {
    try {
      // Create second user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify couple exists
      const coupleDoc = await getDoc(doc(db, 'couples', inviteCode));
      if (!coupleDoc.exists()) {
        throw new Error('Código de invitación inválido');
      }

      // Check if couple already has 2 members
      const membersQuery = query(
        collection(db, 'couple_members'),
        where('couple_id', '==', inviteCode)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      if (membersSnapshot.size >= 2) {
        throw new Error('Esta pareja ya está completa');
      }

      // Create user profile
      await addDoc(collection(db, 'user_profiles'), {
        id: user.uid,
        email: user.email,
        display_name: name,
        couple_id: inviteCode,
        avatar_url: null,
        preferences: {},
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Create couple member
      await addDoc(collection(db, 'couple_members'), {
        couple_id: inviteCode,
        user_id: user.uid,
        name: name,
        role: 'partner_2',
        avatar_url: null,
        created_at: serverTimestamp(),
      });

      return { user: userCredential, couple: coupleDoc.data() };
    } catch (error) {
      console.error('Error in joinCouple:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  },

  async signOut() {
    await firebaseSignOut(auth);
  },

  async getCurrentUser() {
    return auth.currentUser;
  },

  async getUserProfile(userId: string) {
    const profileQuery = query(
      collection(db, 'user_profiles'),
      where('id', '==', userId)
    );
    const profileSnapshot = await getDocs(profileQuery);
    
    if (profileSnapshot.empty) {
      throw new Error('Perfil de usuario no encontrado');
    }
    
    return profileSnapshot.docs[0].data() as User;
  },

  async getCoupleInfo(userId: string) {
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile.couple_id) {
      throw new Error('Usuario no pertenece a ninguna pareja');
    }

    const coupleDoc = await getDoc(doc(db, 'couples', userProfile.couple_id));
    if (!coupleDoc.exists()) {
      throw new Error('Pareja no encontrada');
    }

    return {
      couple_id: userProfile.couple_id,
      couple: coupleDoc.data() as Couple,
    };
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    const profileQuery = query(
      collection(db, 'user_profiles'),
      where('id', '==', userId)
    );
    const profileSnapshot = await getDocs(profileQuery);
    
    if (!profileSnapshot.empty) {
      const profileDoc = profileSnapshot.docs[0];
      await updateDoc(profileDoc.ref, {
        ...updates,
        updated_at: serverTimestamp(),
      });
    }
  },

  // Messages
  async getMessages(coupleId: string, limitCount: number = 50) {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(messagesQuery);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as Message[];

    // Get sender names
    for (const message of messages) {
      try {
        const senderProfile = await this.getUserProfile(message.sender_id);
        message.sender_name = senderProfile.display_name;
      } catch (error) {
        message.sender_name = 'Usuario';
      }
    }

    return messages;
  },

  async sendMessage(coupleId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'sticker' | 'voice' = 'text') {
    const messageRef = await addDoc(collection(db, 'messages'), {
      couple_id: coupleId,
      sender_id: senderId,
      content,
      message_type: messageType,
      created_at: serverTimestamp(),
    });

    return { id: messageRef.id };
  },

  // Diary
  async getDiaryEntries(coupleId: string, limitCount: number = 20) {
    const entriesQuery = query(
      collection(db, 'diary_entries'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(entriesQuery);
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as DiaryEntry[];

    // Get author names
    for (const entry of entries) {
      try {
        const authorProfile = await this.getUserProfile(entry.author_id);
        entry.author_name = authorProfile.display_name;
      } catch (error) {
        entry.author_name = 'Usuario';
      }
    }

    return entries;
  },

  async createDiaryEntry(coupleId: string, authorId: string, title: string, content: string, mood: string, photos: string[] = []) {
    const entryRef = await addDoc(collection(db, 'diary_entries'), {
      couple_id: coupleId,
      author_id: authorId,
      title,
      content,
      mood,
      photos,
      created_at: serverTimestamp(),
    });

    return { id: entryRef.id };
  },

  // Events
  async getEvents(coupleId: string) {
    const eventsQuery = query(
      collection(db, 'events'),
      where('couple_id', '==', coupleId),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || new Date(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as Event[];
  },

  async createEvent(coupleId: string, createdBy: string, title: string, description: string, date: string, type: 'anniversary' | 'date' | 'special' | 'reminder') {
    const eventRef = await addDoc(collection(db, 'events'), {
      couple_id: coupleId,
      created_by: createdBy,
      title,
      description,
      date: new Date(date),
      type,
      created_at: serverTimestamp(),
    });

    return { id: eventRef.id };
  },

  // Activities
  async getActivities() {
    const activitiesQuery = query(
      collection(db, 'activities'),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as Activity[];
  },

  async getCoupleActivities(coupleId: string) {
    const activitiesQuery = query(
      collection(db, 'couple_activities'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(activitiesQuery);
    const coupleActivities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
      completed_at: doc.data().completed_at?.toDate(),
    })) as CoupleActivity[];

    // Get activity details
    for (const coupleActivity of coupleActivities) {
      try {
        const activityDoc = await getDoc(doc(db, 'activities', coupleActivity.activity_id));
        if (activityDoc.exists()) {
          coupleActivity.activity = {
            id: activityDoc.id,
            ...activityDoc.data(),
            created_at: activityDoc.data().created_at?.toDate() || new Date(),
          } as Activity;
        }
      } catch (error) {
        console.error('Error loading activity details:', error);
      }
    }

    return coupleActivities;
  },

  async addActivityToCouple(coupleId: string, activityId: string) {
    const activityRef = await addDoc(collection(db, 'couple_activities'), {
      couple_id: coupleId,
      activity_id: activityId,
      status: 'pending',
      notes: '',
      created_at: serverTimestamp(),
    });

    return { id: activityRef.id };
  },

  async updateCoupleActivity(coupleActivityId: string, updates: Partial<CoupleActivity>) {
    const activityRef = doc(db, 'couple_activities', coupleActivityId);
    await updateDoc(activityRef, {
      ...updates,
      ...(updates.completed_at && { completed_at: updates.completed_at }),
    });
  },

  async getRandomActivity(category?: string, excludeCompleted: boolean = true, coupleId?: string) {
    let activitiesQuery = query(collection(db, 'activities'));
    
    if (category) {
      activitiesQuery = query(
        collection(db, 'activities'),
        where('category', '==', category)
      );
    }

    const snapshot = await getDocs(activitiesQuery);
    let activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as Activity[];

    if (excludeCompleted && coupleId) {
      const completedQuery = query(
        collection(db, 'couple_activities'),
        where('couple_id', '==', coupleId),
        where('status', '==', 'completed')
      );
      const completedSnapshot = await getDocs(completedQuery);
      const completedIds = completedSnapshot.docs.map(doc => doc.data().activity_id);
      
      activities = activities.filter(a => !completedIds.includes(a.id));
    }

    if (activities.length === 0) {
      const allSnapshot = await getDocs(query(collection(db, 'activities')));
      activities = allSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
      })) as Activity[];
    }

    return activities[Math.floor(Math.random() * activities.length)];
  },

  // Weekly Challenges
  async getWeeklyChallenges(coupleId: string) {
    const challengesQuery = query(
      collection(db, 'weekly_challenges'),
      where('couple_id', '==', coupleId),
      orderBy('week_start', 'desc')
    );
    
    const snapshot = await getDocs(challengesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      week_start: doc.data().week_start?.toDate() || new Date(),
      created_at: doc.data().created_at?.toDate() || new Date(),
      completed_at: doc.data().completed_at?.toDate(),
    })) as WeeklyChallenge[];
  },

  async createWeeklyChallenge(coupleId: string, title: string, description: string) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    const challengeRef = await addDoc(collection(db, 'weekly_challenges'), {
      couple_id: coupleId,
      title,
      description,
      week_start: startOfWeek,
      status: 'active',
      created_at: serverTimestamp(),
    });

    return { id: challengeRef.id };
  },

  async updateWeeklyChallenge(challengeId: string, updates: Partial<WeeklyChallenge>) {
    const challengeRef = doc(db, 'weekly_challenges', challengeId);
    await updateDoc(challengeRef, {
      ...updates,
      ...(updates.completed_at && { completed_at: updates.completed_at }),
    });
  },

  // Wishlist
  async getWishlistItems(coupleId: string) {
    const wishlistQuery = query(
      collection(db, 'wishlist_items'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(wishlistQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
      completed_at: doc.data().completed_at?.toDate(),
    })) as WishlistItem[];
  },

  async createWishlistItem(
    coupleId: string,
    addedBy: string,
    title: string,
    description: string,
    category: 'travel' | 'experiences' | 'gifts' | 'goals' | 'general',
    priority: 'low' | 'medium' | 'high' | 'urgent',
    estimatedCost?: number,
    imageUrl?: string
  ) {
    const itemRef = await addDoc(collection(db, 'wishlist_items'), {
      couple_id: coupleId,
      added_by: addedBy,
      title,
      description,
      category,
      priority,
      estimated_cost: estimatedCost || null,
      image_url: imageUrl || null,
      is_completed: false,
      created_at: serverTimestamp(),
    });

    return { id: itemRef.id };
  },

  async updateWishlistItem(itemId: string, updates: Partial<WishlistItem>) {
    const itemRef = doc(db, 'wishlist_items', itemId);
    await updateDoc(itemRef, {
      ...updates,
      ...(updates.completed_at && { completed_at: updates.completed_at }),
    });
  },

  async deleteWishlistItem(itemId: string) {
    const itemRef = doc(db, 'wishlist_items', itemId);
    await deleteDoc(itemRef);
  },

  // Gallery
  async getGalleryItems(coupleId: string, folder?: string) {
    let galleryQuery = query(
      collection(db, 'gallery_items'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc')
    );

    if (folder && folder !== 'all') {
      galleryQuery = query(
        collection(db, 'gallery_items'),
        where('couple_id', '==', coupleId),
        where('folder', '==', folder),
        orderBy('created_at', 'desc')
      );
    }

    const snapshot = await getDocs(galleryQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    }));
  },

  async uploadGalleryItem(
    coupleId: string,
    uploadedBy: string,
    title: string,
    url: string,
    type: 'photo' | 'video',
    folder: string
  ) {
    const itemRef = await addDoc(collection(db, 'gallery_items'), {
      couple_id: coupleId,
      uploaded_by: uploadedBy,
      title,
      url,
      type,
      folder,
      is_favorite: false,
      created_at: serverTimestamp(),
    });

    return { id: itemRef.id };
  },

  async toggleGalleryFavorite(itemId: string, isFavorite: boolean) {
    const itemRef = doc(db, 'gallery_items', itemId);
    await updateDoc(itemRef, { is_favorite: isFavorite });
  },

  async deleteGalleryItem(itemId: string) {
    const itemRef = doc(db, 'gallery_items', itemId);
    await deleteDoc(itemRef);
  },

  // Real-time subscriptions
  subscribeToMessages(coupleId: string, callback: (messages: Message[]) => void) {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('couple_id', '==', coupleId),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    return onSnapshot(messagesQuery, async (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
      })) as Message[];

      // Get sender names
      for (const message of messages) {
        try {
          const senderProfile = await this.getUserProfile(message.sender_id);
          message.sender_name = senderProfile.display_name;
        } catch (error) {
          message.sender_name = 'Usuario';
        }
      }

      callback(messages);
    });
  },

  // Initialize default data
  async initializeDefaultActivities() {
    const activitiesSnapshot = await getDocs(collection(db, 'activities'));
    
    if (activitiesSnapshot.empty) {
      const defaultActivities = [
        {
          title: 'Cena a la luz de las velas',
          description: 'Preparen una cena romántica en casa con velas y música suave',
          category: 'romantic',
          difficulty: 'easy',
          duration: '2 horas',
          is_surprise: false,
        },
        {
          title: 'Baño relajante juntos',
          description: 'Disfruten de un baño con sales aromáticas y pétalos de rosa',
          category: 'romantic',
          difficulty: 'easy',
          duration: '1 hora',
          is_surprise: false,
        },
        {
          title: 'Maratón de películas',
          description: 'Vean sus películas favoritas con palomitas y snacks',
          category: 'fun',
          difficulty: 'easy',
          duration: '4 horas',
          is_surprise: false,
        },
        {
          title: 'Karaoke en casa',
          description: 'Canten sus canciones favoritas juntos',
          category: 'fun',
          difficulty: 'easy',
          duration: '1 hora',
          is_surprise: false,
        },
        {
          title: 'Sorpresa misteriosa',
          description: 'Uno de los dos prepara una sorpresa secreta para el otro',
          category: 'surprise',
          difficulty: 'medium',
          duration: '2 horas',
          is_surprise: true,
        },
        {
          title: 'Reto de 24 horas sin teléfono',
          description: 'Pasen 24 horas sin usar sus teléfonos, solo disfrutándose',
          category: 'challenge',
          difficulty: 'hard',
          duration: '24 horas',
          is_surprise: false,
        },
      ];

      for (const activity of defaultActivities) {
        await addDoc(collection(db, 'activities'), {
          ...activity,
          created_at: serverTimestamp(),
        });
      }
    }
  },
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
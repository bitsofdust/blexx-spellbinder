// BLEXX SPELLBINDER — THE PUBLIC GRIMOIRE (Firestore client)
// ES module. Exposes window.GRIMOIRE_CLOUD when the connection stands;
// everything in index.html degrades to localStorage when it doesn't —
// the Spellbinder must bind spells even with the cloud unreachable.
//
// Data model (rules in firestore.rules):
//   spells/{registryId}      — the public spell (votes counter on the doc)
//   spells/{id}/votes/{vid}  — one vote per anonymous voter id, create-only
//   counters/{CHA|DEV|MAN}   — atomic registry mint, 900 cap
//   orders/{id}              — create-only kit orders ($20 checkout at launch)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, doc, runTransaction, setDoc, addDoc, getDocs,
  query, orderBy, limit, updateDoc, increment, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC_x8yKJF7MktLQQJXiKaY-qSidMOBq8ks',
  authDomain: 'blexx-spellbinder.firebaseapp.com',
  projectId: 'blexx-spellbinder',
  storageBucket: 'blexx-spellbinder.firebasestorage.app',
  messagingSenderId: '1036613918692',
  appId: '1:1036613918692:web:6c58aeb58ae954317f71f1',
};

let db = null;
try {
  db = getFirestore(initializeApp(FIREBASE_CONFIG));
} catch (e) {
  console.warn('GRIMOIRE: cloud unreachable, binding locally.', e);
}

function spellDocId(registryLabel) {
  return registryLabel.replace(/[^A-Za-z0-9-]/g, '-');   // BLX-MAN-001-900
}

const GRIMOIRE_CLOUD = {
  ready: !!db,

  // Mint the real registry number — atomic, monotonic, closes at 900.
  async mint(houseCode) {
    const ref = doc(db, 'counters', houseCode);
    return runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      const n = (snap.exists() ? snap.data().n : 0) + 1;
      if (n > 900) throw new Error('The House of ' + houseCode + ' registry has closed at 900/900.');
      if (snap.exists()) tx.update(ref, { n }); else tx.set(ref, { n });
      return n;
    });
  },

  async publish(spell) {
    const id = spellDocId(spell.registry.label);
    await setDoc(doc(db, 'spells', id), {
      ...spell,
      votes: 0,
      createdAt: serverTimestamp(),
    });
    return id;
  },

  async list(sort) {
    const q = query(collection(db, 'spells'),
      orderBy(sort === 'top' ? 'votes' : 'createdAt', 'desc'), limit(60));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // One charge per voter per spell; the votes doc id dedupes server-side.
  async vote(spellId, voterId) {
    await setDoc(doc(db, 'spells', spellId, 'votes', voterId), { at: Date.now() });
    await updateDoc(doc(db, 'spells', spellId), { votes: increment(1) });
  },

  // Kit order intent — checkout redirect arrives with the Stripe functions.
  async order(spellId) {
    const ref = await addDoc(collection(db, 'orders'), {
      spellId, status: 'new', createdAt: serverTimestamp(),
    });
    return ref.id;
  },
};

window.GRIMOIRE_CLOUD = GRIMOIRE_CLOUD;
window.dispatchEvent(new Event('grimoire-ready'));

import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";

export const sendMessage = async (text, senderId, role, org) => {
  await addDoc(collection(db, "messages"), {
    text,
    senderId,
    org,
    timestamp: Date.now(),
  });
};

export const subscribeMessages = (org, callback) => {
  const q = query(
    collection(db, "messages"),
    where("org", "==", org),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

export const getOrgMessage = async (org) => { 
  const q = query(
    collection(db, "messages"),
    where("org", "==", org),
  );  
  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return messages;
}
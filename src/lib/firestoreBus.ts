import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function addBus(busData: any) {
  await addDoc(collection(db, "buses"), busData);
}

import { doc, runTransaction } from 'firebase/firestore';

export const generateOrderNumber = async (db, appId) => {
  const today = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(today.getTime() + istOffset);
  const dateKey = istDate.toISOString().split('T')[0].replace(/-/g, '');
  
  const counterDocRef = doc(db, 'artifacts', appId, 'public', 'meta', 'orderCounters', dateKey);
  
  try {
    const orderNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      
      let newCounter = 1;
      if (counterDoc.exists()) {
        newCounter = (counterDoc.data().counter || 0) + 1;
      }
      
      transaction.set(counterDocRef, { counter: newCounter, date: dateKey }, { merge: true });
      
      return `DKN-${newCounter.toString().padStart(3, '0')}`;
    });
    
    return orderNumber;
  } catch (error) {
    console.error('CRITICAL: Failed to generate order number with transaction:', error);
    throw new Error(`Failed to generate order number. Please check your internet connection and try again.`);
  }
};

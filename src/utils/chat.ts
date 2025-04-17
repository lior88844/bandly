import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { UserProfile } from '../types/user'

export async function getOrCreateConversation(
  currentUser: UserProfile,
  otherUser: UserProfile
) {
  if (!currentUser.id || !otherUser.id) {
    throw new Error('Both users must have valid IDs')
  }

  // Create a unique ID for the conversation
  const participantIds = [currentUser.id, otherUser.id].sort()
  const conversationId = participantIds.join('_')

  // Check if conversation exists
  const conversationRef = doc(db, 'conversations', conversationId)
  const conversationDoc = await getDoc(conversationRef)

  if (!conversationDoc.exists()) {
    // Create new conversation with valid data
    const conversationData = {
      participants: participantIds,
      participantInfo: {
        [currentUser.id]: {
          username: currentUser.username || '',
          instrument: currentUser.instrument || null,
        },
        [otherUser.id]: {
          username: otherUser.username || '',
          instrument: otherUser.instrument || null,
        },
      },
      lastMessage: {
        text: '',
        timestamp: serverTimestamp(),
        senderId: '',
      },
      createdAt: serverTimestamp(),
    }

    await setDoc(conversationRef, conversationData)
  }

  return conversationId
}

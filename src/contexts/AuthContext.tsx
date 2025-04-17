import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { UserProfile } from '../types/user'

interface UserData {
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ user: User }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Fetch user data from Firestore
        const userRef = doc(db, 'users', user.uid)
        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData({
              ...doc.data(),
              id: user.uid,
            } as UserProfile)
          }
        })

        return () => unsubscribe()
      } else {
        setUserData(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      userData,
      loading,
      signIn: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password)
      },
      signUp: async (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password)
      },
      logout: async () => {
        await signOut(auth)
      },
    }),
    [user, userData, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

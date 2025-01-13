export function getFirebaseErrorMessage(error: any): string {
  const errorCode = error?.code as string

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'Email or password is incorrect'
    case 'auth/wrong-password':
      return 'Email or password is incorrect'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    default:
      return 'An error occurred. Please try again'
  }
}

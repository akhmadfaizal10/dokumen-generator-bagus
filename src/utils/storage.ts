// Storage utilities for managing user data\

export interface UserData {
  userId: string;
  letterheads: any[];
  savedDocuments: any[];
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  letterheadId?: string;
  documentData: any;
  createdAt: string;
  updatedAt: string;
}

// Generate or get user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Get user data
export const getUserData = (): UserData => {
  const userId = getUserId();
  const userData = localStorage.getItem(`userData_${userId}`);
  
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  return {
    userId,
    letterheads: [],
    savedDocuments: [],
    projects: []
  };
};

// Save user data
export const saveUserData = (data: UserData): void => {
  const userId = getUserId();
  try {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Convert base64 to blob URL
export const base64ToBlob = (base64: string): string => {
  try {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return base64;
  }
};

// Save letterhead to storage
export const saveLetterhead = (letterhead: any): void => {
  const userData = getUserData();
  const existingIndex = userData.letterheads.findIndex(l => l.id === letterhead.id); // <-- Ini penting
  
  if (existingIndex >= 0) {
    userData.letterheads[existingIndex] = letterhead;
  } else {
    userData.letterheads.push(letterhead);
  }
  
  saveUserData(userData);
};

// Get all letterheads
export const getLetterheads = (): any[] => {
  const userData = getUserData();
  return userData.letterheads || [];
};

// Save document
export const saveDocument = (document: any): void => {
  const userData = getUserData();
  const existingIndex = userData.savedDocuments.findIndex(d => d.id === document.id);
  
  if (existingIndex >= 0) {
    userData.savedDocuments[existingIndex] = document;
  } else {
    userData.savedDocuments.push(document);
  }
  
  saveUserData(userData);
};

// Get all saved documents
export const getSavedDocuments = (): any[] => {
  const userData = getUserData();
  return userData.savedDocuments || [];
};

// Delete document
export const deleteDocument = (documentId: string): void => {
  const userData = getUserData();
  userData.savedDocuments = userData.savedDocuments.filter(d => d.id !== documentId);
  saveUserData(userData);
};

// Delete letterhead
export const deleteLetterhead = (letterheadId: string): void => {
  const userData = getUserData();
  userData.letterheads = userData.letterheads.filter(l => l.id !== letterheadId);
  saveUserData(userData);
};
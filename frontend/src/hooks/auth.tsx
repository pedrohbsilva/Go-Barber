import React, { createContext, useCallback, useState, useContext } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface signInCredencials {
  email: string;
  password: string;
}

interface AuthContextDate {
  user: User;
  signIn(credencials: signInCredencials): Promise<void>;
  signOut(): void;
  updateUser(user: User): void;
}

const AuthContext = createContext<AuthContextDate>({} as AuthContextDate);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('Capptei:Token');
    const user = localStorage.getItem('Capptei:User');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }
    return {} as AuthState;
  });
  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem('Capptei:Token', token);
    localStorage.setItem('Capptei:User', JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;
    setData({ token, user });
  }, []);
  const signOut = useCallback(() => {
    localStorage.removeItem('Capptei:Token');
    localStorage.removeItem('Capptei:User');

    setData({} as AuthState);
  }, []);
  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('Capptei:User', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );
  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
function useAuth(): AuthContextDate {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('UseAuth must be used within a AuthProvider');
  }
  return context;
}
export { AuthProvider, useAuth };

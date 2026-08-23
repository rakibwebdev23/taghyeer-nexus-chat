import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginResponse } from '@/types/chat';
import { api } from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ phone, name }: { phone: string; name: string }, { rejectWithValue }) => {
    try {
      const res: LoginResponse = await api.login(phone, name);
      localStorage.setItem('nexus_chat_token', res.token);
      localStorage.setItem('nexus_chat_user', JSON.stringify(res.user));
      initSocket(res.token);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// session restoration
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    const savedToken = localStorage.getItem('nexus_chat_token');
    const savedUser = localStorage.getItem('nexus_chat_user');

    if (!savedToken) {
      return rejectWithValue('No saved session token');
    }

    try {
      initSocket(savedToken);
      let user: User | null = null;
      if (savedUser) {
        try {
          user = JSON.parse(savedUser);
        } catch {}
      }

      const res = await api.getMe();
      if (res.user) {
        user = res.user;
        localStorage.setItem('nexus_chat_user', JSON.stringify(res.user));
      }

      return { token: savedToken, user: user as User };
    } catch (err: any) {
      localStorage.removeItem('nexus_chat_token');
      localStorage.removeItem('nexus_chat_user');
      disconnectSocket();
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('nexus_chat_token');
      localStorage.removeItem('nexus_chat_user');
      disconnectSocket();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // restore Session
    builder.addCase(restoreSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
    });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

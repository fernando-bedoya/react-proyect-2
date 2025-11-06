// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../models/User";
import { getUser as getStoredUser, setUser as setStoredUser, clearUser as clearStoredUser } from '../utils/userStorage';
//Definir la composición de la variable reactiva
interface UserState {
    user: User | null;
}

const storedUser = getStoredUser();
const initialState: UserState = {
    user: storedUser ? (storedUser as User) : null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            if (action.payload) {
                setStoredUser(action.payload);
            } else {
                clearStoredUser();
            }
        },
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
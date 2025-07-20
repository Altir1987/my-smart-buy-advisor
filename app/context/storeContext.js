'use client'
import {createContext,useContext,useReducer} from 'react'

const StoreContext = createContext()

const initialState = {
}

function reducer(state = initialState, action) {
    return state
}

export function StoreProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
    )
};

export function useStore() {
    return useContext(StoreContext);
}
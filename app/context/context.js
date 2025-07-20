'use client'
import {createContext,useContext,useReducer} from 'react'

const Context = createContext()

const initialState = {
}

function reducer(state = initialState, action) {
    return state
}

export function StoreProvider({children}) {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
    )
};

export function useStore() {
    return useContext(Context);
}
import {createContext, useContext, useEffect} from "react"
import { usersService } from "../service/user.service"

const NewContext = createContext()


export const ContextUser = ({children}) => {
    const {login, user, registerUser, userSession, logoutUser} = usersService()
    
    useEffect(() => {
        userSession()
  }, [])
  
  return (
      <NewContext.Provider value={{user, login, registerUser, logoutUser}}> 
        {children}
    </NewContext.Provider>
  )
}

export const authenticated = () => useContext(NewContext)
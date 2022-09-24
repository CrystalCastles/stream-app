import { Amplify, Hub } from "aws-amplify";

import { Authenticator } from "@aws-amplify/ui-react";

import awsExports from "../../aws-exports";

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getAuthenticatedUser, signOutAuthenticatedUser } from "../../store/auth-actions";
import Button from "../UI/Button/Button";
import classes from './AuthComponent.module.css';

// import { Auth } from "aws-amplify";

Amplify.configure(awsExports);

export default function AuthComponent() {
  const userDispatch = useDispatch();

  Hub.listen('auth', (data) => {
    const { payload } = data;
    onAuthEvent(payload);           
    console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
  })

  const onAuthEvent = (payload) => {
    if(payload.event === 'signIn') {
      userDispatch(getAuthenticatedUser());
    } else if(payload.event === 'signOut') {
      userDispatch(signOutAuthenticatedUser());
    }
  }

  // const deleteUser = async () => {
  //   try {
  //     const result = await Auth.deleteUser();
  //     console.log(result);
  //   } catch (error) {
  //     console.log('Error deleting user', error);
  //   }
  // }

  return (
    <div className={classes.authenticator}>
      <Authenticator style={{color: 'red'}}>
        {({ signOut, user }) => (
          <main className={classes['profile']}>
            <h1 className={classes.intro}>Hello {user.username}</h1>
            <Button className={classes.button} onClick={signOut}>Sign Out</Button>
            {/* <button onClick={deleteUser}>Delete account and all comments.</button> */}
          </main>
        )}
      </Authenticator>
    </div>
  );
}

// import { Authenticator } from "@aws-amplify/ui-react";
// import { useEffect, useState } from "react";
// import { Auth } from "aws-amplify";
// import { useSelector, useDispatch } from "react-redux";
// import { getAuthenticatedUser } from "./store/auth-actions";

// function AuthComponent() {
//   const userDispatch = useDispatch();
//   // const user = useSelector((state) => state.auth.user);

//   // const [user, updateUser] = useState(null);

//   // useEffect(() => {
//   //   userDispatch(getAuthenticatedUser());
//   // }, [userDispatch]);

//   return (
//     <Authenticator>
//       {({ signOut, user }) => (
//         <main>
//           <h1>Hello {user.username}</h1>
//           <button onClick={signOut}>Sign out</button>
//         </main>
//       )}
//     </Authenticator>
//   );
// }

// export default AuthComponent;

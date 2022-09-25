import { Amplify, Hub, Auth, API } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { deleteComment as DeleteComment } from "../../graphql/mutations";

import awsExports from "../../aws-exports";

import { useDispatch } from 'react-redux';
import { getAuthenticatedUser, signOutAuthenticatedUser } from "../../store/auth-actions";
import Button from "../UI/Button/Button";
import classes from './AuthComponent.module.css';

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

  const deleteUser = async () => {
    let owner = 'depichar';
    try {
      // const result = await Auth.deleteUser();
      
        await API.graphql({
          query: DeleteComment,
          variables: {
            input: { owner },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
      // console.log(result);
    } catch (error) {
      console.log('Error deleting user', error);
    }
  }

  return (
    <div className={classes.authenticator}>
      <Authenticator style={{color: 'red'}}>
        {({ signOut, user }) => (
          <main className={classes['profile']}>
            <h1 className={classes.intro}>Hello, {user.username}.</h1>
            <Button className={classes.button} onClick={signOut}>Sign Out</Button>
            <Button className={classes['delete-button']} onClick={deleteUser}>Delete account and all comments.</Button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
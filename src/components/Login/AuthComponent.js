import { Amplify, Hub, Auth, API } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { deleteComment as DeleteComment } from "../../graphql/mutations";
import { SliderPicker } from '@hello-pangea/color-picker';

import awsExports from "../../aws-exports";

import { useDispatch, useSelector } from 'react-redux';
import { getAuthenticatedUser, signOutAuthenticatedUser } from "../../store/auth-actions";
import Button from "../UI/Button/Button";
import classes from './AuthComponent.module.css';
import Modal from "../UI/Modal/Modal";
import { useEffect, useState } from "react";

Amplify.configure(awsExports);

export default function AuthComponent() {
  const userColor = useSelector((state) => state.auth.user);
  const [modalDisplay, setModalDisplay] = useState(false);
  const [chatColor, setChatColor] = useState(null);

  const userDispatch = useDispatch();

  useEffect(() => {
    Hub.listen('auth', (data) => {
      const { payload } = data;
      onAuthEvent(payload);           
      console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
    })
  }, [])

  const onAuthEvent = (payload) => {
    if(payload.event === 'signIn') {
      userDispatch(getAuthenticatedUser());
    } else if(payload.event === 'signOut') {
      userDispatch(signOutAuthenticatedUser());
    }
  }

  const deleteUser = async () => {
    // let owner = 'depichar';
    // try {
    //   // const result = await Auth.deleteUser();
      
    //     await API.graphql({
    //       query: DeleteComment,
    //       variables: {
    //         input: { owner },
    //       },
    //       authMode: "AMAZON_COGNITO_USER_POOLS",
    //     });
    //   // console.log(result);
    // } catch (error) {
    //   console.log('Error deleting user', error);
    // }
  }

  async function updateUserColor() {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, {
      'custom:chat_color': chatColor
    });
    userDispatch(getAuthenticatedUser());
    setModalDisplay(prevState => !prevState);
  }

  const modalHandler = () => {
    setModalDisplay(prevState => !prevState);
  };

  const chatColorHandler = (color) => {
    setChatColor(color.hex);
  }

  return (
    <div className={classes.authenticator}>
      <Authenticator>
        {({ signOut, user }) => (
          <main className={classes['profile']}>
            <h1 className={classes.intro}>Hello, {<span style={{display: 'inline', color: userColor.chatColor ? userColor.chatColor : '#ebebeb'}}>{user.username}</span>}.</h1>
            <Button onClick={modalHandler}>Change Name Color</Button>
            {modalDisplay && <Modal content={<SliderPicker color={ user.attributes.color ? user.attributes.color : '#95d279'} onChangeComplete={chatColorHandler}/>} onConfirm={modalHandler} onApply={updateUserColor} title="Change display name color"/> }
            <Button className={classes.button} onClick={signOut}>Sign Out</Button>
            <Button className={classes['delete-button']} onClick={deleteUser}>Delete account and all comments.</Button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
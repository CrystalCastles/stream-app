import { Amplify, Hub, Auth, API } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { deleteComment as DeleteComment } from "../../graphql/mutations";
import { listComments as ListComments } from "../../graphql/queries";
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
  const userFromState = useSelector((state) => state.auth.user);
  const [colorModalDisplay, setColorModalDisplay] = useState(false);
  const [deleteModalDisplay, setDeleteModalDisplay] = useState(false);
  const [messageColor, setMessageColor] = useState(null);

  const userDispatch = useDispatch();

  useEffect(() => {
    Hub.listen('auth', (data) => {
      const { payload } = data;
      onAuthEvent(payload);           
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
    try {
      let user = userFromState.username;
      const commentData = await API.graphql({
        query: ListComments,
      });
      commentData.data.listComments.items.forEach(item => {
        if(item.owner == user) {
          let id = item.id;
          API.graphql({
            query: DeleteComment,
            variables: {
              input: { id },
            },
            authMode: "AMAZON_COGNITO_USER_POOLS",
          });
        }
      })
      const result = await Auth.deleteUser();
      console.log(result);
    } catch (error) {
      console.log('Error deleting user', error);
    }
  }

  async function updateUserColor() {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, {
      'custom:chat_color': messageColor
    });
    userDispatch(getAuthenticatedUser());
    setColorModalDisplay(prevState => !prevState);
  }

  const colorModalHandler = () => {
    setColorModalDisplay(prevState => !prevState);
  };

  const deleteModalHandler = () => {
    setDeleteModalDisplay(prevState => !prevState);
  };

  const chatColorHandler = (color) => {
    setMessageColor(color.hex);
  }

  return (
    <div className={classes.authenticator}>
      <Authenticator>
        {({ signOut, user }) => (
          <main className={classes['profile']}>
            <h1 className={classes.intro}>Hello, {<span style={{display: 'inline', color: userFromState ? userFromState.chatColor : '#ebebeb'}}>{user.username}</span>}.</h1>
            <Button onClick={colorModalHandler}>Change Name Color</Button>
            {colorModalDisplay && <Modal content={<SliderPicker color={ user.attributes.color ? user.attributes.color : '#95d279'} onChangeComplete={chatColorHandler}/>} onConfirm={colorModalHandler} onApply={updateUserColor} title="Change display name color"/> }
            <Button className={classes.button} onClick={signOut}>Sign Out</Button>
            <Button className={classes['delete-button']} onClick={deleteModalHandler}>Delete account and all comments.</Button>
            {deleteModalDisplay && <Modal content={'Are you sure you want to delete your account? This action cannot be undone.'} onConfirm={deleteModalHandler} onApply={deleteUser} title="Delete your account and all chat messages."/>}
          </main>
        )}
      </Authenticator>
    </div>
  );
}
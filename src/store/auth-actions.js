import { authActions } from "./auth-slice";
import { Auth } from "aws-amplify";

export const getAuthenticatedUser = () => {
  return async (dispatch) => {
    await Auth.currentAuthenticatedUser()
      .then((currentUser) => {
        dispatch(authActions.setUser({ user: {username: currentUser.username, chatColor: currentUser.attributes['custom:chat_color'] } }))
      }
      )
      .catch((err) => console.log({ err }));
  };
};

export const signOutAuthenticatedUser = () => {
  return (dispatch) => {
    dispatch(authActions.removeUser());
  }
};
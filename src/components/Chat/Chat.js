import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useReducer, Fragment } from "react";
import { getAuthenticatedUser } from "../../store/auth-actions";
import { API, Auth } from "aws-amplify";
import { createComment as CreateComment } from "../../graphql/mutations";
import { listComments as ListComments } from "../../graphql/queries";
import { onCreateComment as OnCreateComment } from "../../graphql/subscriptions";

import classes from "./Chat.module.css";
import ErrorModal from "../UI/Modal/ErrorModal";
import { Link } from "react-router-dom";

const initialState = {
  comments: [],
};

function chatReducer(state, action) {
  switch (action.type) {
    case "SET_COMMENTS":
      return {
        ...state,
        comments: action.comments,
      };
    case "ADD_COMMENT":
      return {
        ...state,
        comments: [...state.comments, action.comment],
      };
    default:
      return state;
  }
}

const Chat = () => {
  const userDispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // const [user, setUser] = useState(null);
  const [state, chatDispatch] = useReducer(chatReducer, initialState);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState();

  // useEffect(() => {
  //   userDispatch(getAuthenticatedUser());
  // }, [userDispatch]);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    // Auth.currentAuthenticatedUser()
    //   .then((currentUser) => setUser(currentUser))
    //   .catch((err) => console.log({ err }));

    const sub = API.graphql({
      query: OnCreateComment,
    }).subscribe({
      next: async (commentData) => {
        console.log({ commentData });
        const {
          value: { data },
        } = commentData;
        try {
          const user = await Auth.currentAuthenticatedUser();
          if (user.username === data.onCreateComment.owner) {
            return;
          }
          chatDispatch({ type: "ADD_COMMENT", comment: data.onCreateComment });
        } catch (err) {
          chatDispatch({ type: "ADD_COMMENT", comment: data.onCreateComment });
        }
      },
      error: (err) => console.log(err),
    });

    return () => sub.unsubscribe();
  }, [chatDispatch]);

  async function fetchComments() {
    const commentData = await API.graphql({
      query: ListComments,
    });
    chatDispatch({
      type: "SET_COMMENTS",
      comments: commentData.data.listComments.items.sort((a, b) =>
        a.createdAt < b.createdAt ? -1 : 0
      ),
    });
  }

  async function createComment() {
    if (!user) {
      const message = <Link to='/profile'>Please sign up or log in.</Link>;
      setError({
        title: 'No user is logged in.',
        message: message
      })
    } else {
      if (!inputValue) return;
      const message = inputValue;
      setInputValue("");
      chatDispatch({
        type: "ADD_COMMENT",
        comment: { message, owner: user },
      });
      await API.graphql({
        query: CreateComment,
        variables: {
          input: { message },
        },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    }
  }

  function onChange(e) {
    e.persist();
    setInputValue(e.target.value);
  }

  const errorHandler = () => {
    setError(null);
  }

  return (
    <Fragment>
      {error && <ErrorModal title={error.title} message={error.message} onConfirm={errorHandler}/>}
      <div className={classes["chat-area"]}>
        {state.comments.map((comment, index) => (
          <div className={classes.messages} key={index}>
            <p>
              {comment.owner}: {comment.message}
            </p>
          </div>
        ))}
        <div className={classes.input}>
          <input value={inputValue} onChange={onChange} placeholder="comment" />
          <button onClick={createComment}>Send</button>
        </div>
      </div>
    </Fragment>
  );
};

export default Chat;

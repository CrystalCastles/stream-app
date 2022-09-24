import { useSelector } from "react-redux";
import { useState, useEffect, useReducer, useRef, Fragment } from "react";
import { API, Auth } from "aws-amplify";
import { createComment as CreateComment } from "../../graphql/mutations";
import { listComments as ListComments } from "../../graphql/queries";
import { onCreateComment as OnCreateComment } from "../../graphql/subscriptions";

import classes from "./Chat.module.css";
import ErrorModal from "../UI/Modal/ErrorModal";
import Message from "./Message";
import { Link } from "react-router-dom";
import Button from "../UI/Button/Button";
import Input from "../UI/Input/Input";

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
  const user = useSelector((state) => state.auth.user);
  const inputRef = useRef();

  const [state, chatDispatch] = useReducer(chatReducer, initialState);

  const [error, setError] = useState();

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const sub = API.graphql({
      query: OnCreateComment,
    }).subscribe({
      next: async (commentData) => {
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
      const message = <Link to="/profile">Please sign up or log in.</Link>;
      setError({
        title: "No user is logged in.",
        message: message,
      });
    } else {
      if (!inputRef.current.value) return;
      const message = inputRef.current.value;
      inputRef.current.value = "";
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

  // async function deleteComment() {
  //   chatDispatch({
  //     type: "DELETE_COMMENT",
  //     comment
  //   })
  // }

  const errorHandler = () => {
    setError(null);
  };

  const handleEnterSubmit = e => {
    if(e.key === 'Enter') {
      createComment();
    }
  }

  return (
    <Fragment>
      {error && (
        <ErrorModal
          title={error.title}
          message={error.message}
          onConfirm={errorHandler}
        />
      )}
      <div className={classes["chat-area"]}>
        <div className={classes["message-area"]}>
          <div className={classes["message-content"]}>
            {state.comments.map((comment, index) => (
              <Message key={index} owner={comment.owner} message={comment.message} id={comment.id}/>
            ))}
          </div>
        </div>

        <div className={classes["input-area"]}>
          <Input ref={inputRef} onKeyPress={handleEnterSubmit} placeholder="Send a message."/>
          <Button className={classes.button} onClick={createComment}>Send</Button>
        </div>
      </div>
    </Fragment>
  );
};

export default Chat;

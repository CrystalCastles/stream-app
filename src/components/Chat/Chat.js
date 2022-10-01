import { useSelector } from "react-redux";
import { useState, useEffect, useReducer, useRef, Fragment } from "react";
import { API } from "aws-amplify";
import { createComment as CreateComment } from "../../graphql/mutations";
import { deleteComment as DeleteComment } from "../../graphql/mutations";
import { listComments as ListComments } from "../../graphql/queries";
import { onCreateComment as OnCreateComment } from "../../graphql/subscriptions";
import { onDeleteComment as OnDeleteComment } from "../../graphql/subscriptions";

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
    case "DELETE_COMMENT":
      return {
        ...state,
        comments: state.comments.filter(comment => {
          return comment.id !== action.id;
        }),
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
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    fetchComments();

    API.graphql({
      query: OnCreateComment,
    }).subscribe({
      next: async (commentData) => {
        const {
          value: { data },
        } = commentData;
        try {
          chatDispatch({ type: "ADD_COMMENT", comment: data.onCreateComment });
        } catch (err) {
          console.log(err);
        }
      },
      error: (err) => console.log(err),
    });

    API.graphql({
      query: OnDeleteComment,
    }).subscribe({
      next: async (commentData) => {
        const {
          value: { data },
        } = commentData;
        try {
          chatDispatch({ type: "DELETE_COMMENT", id: data.onDeleteComment.id });
        } catch (err) {
          console.log(err);
        }
      },
      error: (err) => console.log(err),
    });
  }, []);

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
      setMessageCount((prevState) => ++prevState);
      if(messageCount === 0) {
        countdown(5);
      }
      if(messageCount > 3) {
        setError( {
          title: 'Spam detected',
          message: 'Please wait before sending more messages.'
        })
      } else {
        if (!inputRef.current.value) return;
        const message = inputRef.current.value;
        inputRef.current.value = "";
        await API.graphql({
          query: CreateComment,
          variables: {
            input: { message, color: user.chatColor },
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        });
      }
      
    }
  }

  async function deleteComment(id) {
    await API.graphql({
      query: DeleteComment,
      variables: {
        input: { id },
      },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
  }

  const countdown = (timeleft) => {
    const countdown = setInterval(() => {
      if(timeleft <= 0){
        clearInterval(countdown);
        setMessageCount(0);
      }
      timeleft -= 1;
    }, 1000);
  }

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
              <Message key={index} owner={comment.owner} message={comment.message} id={comment.id} color={comment.color} onClick={(e) => deleteComment(comment.id, e)}/>
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

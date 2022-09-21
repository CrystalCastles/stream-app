import classes from './Message.module.css';

const Message = props => {
  return (
    <p className={classes.message}>{props.owner}: {props.message}</p>
  )
}

export default Message;
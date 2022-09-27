import Card from "../Card/Card";
import Button from "../Button/Button";
import { Fragment } from "react";

import classes from './Modal.module.css';

const Modal = props => {
  return (
    <Fragment>
      <div className={classes.backdrop} onClick={props.onConfirm} />
      <Card className={classes.modal}>
        <header className={classes.header}>
          <h2>{props.title}</h2>
        </header>
        <div className={classes.content}>
          {props.content}
        </div>
        <footer className={classes.actions}>
          <Button onClick={props.onApply}>Apply</Button>
          <Button onClick={props.onConfirm}>Cancel</Button>
        </footer>
      </Card>
    </Fragment>
  )
}

export default Modal;
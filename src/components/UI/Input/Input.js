import React from 'react';

import classes from './Input.module.css';

const Input = React.forwardRef((props, ref) => {
  const {...other} = props;

  return (
    <div className={`${classes.input} ${props.className}`}>
      {/* <label htmlFor={props.input.id}>{props.label}</label> */}
      <input ref={ref} {...other} />
    </div>
  );
});

export default Input;

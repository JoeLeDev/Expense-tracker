import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  textarea?: false;
};
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  textarea: true;
};

type Props = InputProps | TextareaProps;

export const Input: React.FC<Props> = (props) => {
  if (props.textarea) {
    // @ts-ignore
    return <textarea className="form-control" {...props} />;
  }
  return <input className="form-control" {...props} />;
};

export default Input; 
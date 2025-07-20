import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'normal' | 'small';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    variant && `btn-${variant}`,
    size === 'small' && 'btn-small',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
};

export default Button; 
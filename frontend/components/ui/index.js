'use client';

import styles from '../../app/profiles/profiles.module.css';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button 
    className={`${styles.button} ${styles[variant]} ${className}`} 
    {...props}
  >
    {children}
  </button>
);

export const Input = ({ className = '', ...props }) => (
  <input className={`${styles.formInput} ${className}`} {...props} />
);

export const Select = ({ children, className = '', ...props }) => (
  <select className={`${styles.formSelect} ${className}`} {...props}>
    {children}
  </select>
);

export const Textarea = ({ children, className = '', ...props }) => (
  <textarea className={`${styles.formTextarea} ${className}`} {...props}>
    {children}
  </textarea>
);

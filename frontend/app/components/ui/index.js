'use client';

import styles from '../../profiles/profiles.module.css';

const Card = ({ children, className = '', ...props }) => (
  <div className={`${styles.profileCard} ${className}`} {...props}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }) => (
  <button 
    className={`${styles.button} ${styles[variant]} ${className}`} 
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className = '', ...props }) => (
  <input className={`${styles.formInput} ${className}`} {...props} />
);

const Select = ({ children, className = '', ...props }) => (
  <select className={`${styles.formSelect} ${className}`} {...props}>
    {children}
  </select>
);

const Textarea = ({ children, className = '', ...props }) => (
  <textarea className={`${styles.formTextarea} ${className}`} {...props}>
    {children}
  </textarea>
);

export { Card, Button, Input, Select, Textarea };

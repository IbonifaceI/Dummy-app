import { CSSProperties } from 'react';

export const buttonPrimary: CSSProperties = {
  width: '100%',
  height: 42,
  backgroundColor: '#0055FF',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

export const buttonDisabled: CSSProperties = {
  ...buttonPrimary,
  backgroundColor: '#7b9cff',
  color: '#eee',
  cursor: 'not-allowed',
};

export const errorText: CSSProperties = {
  color: 'red',
  marginTop: 4,
  fontSize: 13,
  textAlign: 'center',
};
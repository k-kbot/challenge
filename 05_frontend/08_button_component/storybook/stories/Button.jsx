import React from 'react';
import PropTypes from 'prop-types';
import './button.css';

export const Button = ({ children, color, size, disabled, onClick }) => {
  const sizes = {
    small: { width: '100px', height: '30px' },
    medium: { width: '150px', height: '45px' },
    large: { width: '200px', height: '60px' },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? 'gray' : color,
        width: sizes[size].width,
        height: sizes[size].height,
        border: 'none',
      }}
    >
      <span style={{ color: 'white' }}>{children}</span>
    </button>
  );
};

Button.propTypes = {
  /**
   * Button contents
   */
  children: PropTypes.string.isRequired,
  /**
   * What background color to use
   */
  color: PropTypes.oneOf(['red', 'blue', 'green']),
  /**
   * How large should the button be?
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * Button is disabled?
   */
  disabled: PropTypes.bool,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,
};

Button.defaultProps = {
  children: 'Button',
  color: 'green',
  size: 'large',
  disabled: false,
  onClick: undefined,
};

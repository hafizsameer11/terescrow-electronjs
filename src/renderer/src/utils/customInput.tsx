import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Option {
  id: string | number;
  title: string;
}

interface InputProps {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  icon?: string;
  errorText?: string;
  isEditable?: boolean;
  onBlur?: (e: React.FocusEvent<any>) => void;
  fontWeight?: 'normal' | 'bold' | '500';
  showPasswordToggle?: boolean;
  options?: Option[];
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  onBlur,
  errorText,
  isEditable = true,
  fontWeight = 'normal',
  showPasswordToggle = false,
  options = [],
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputType, setInputType] = useState(type); // Tracks input type

  /** Toggle password visibility */
  const togglePasswordVisibility = () => {
    setInputType((prevType) =>
      prevType === 'password' ? 'text' : 'password'
    );
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e: React.FocusEvent<any>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e); // Call external onBlur if provided
  };

  return (
    <div className="relative w-full mb-6">
      {type === 'select' ? (
        <>
          <select
            id={id}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={!isEditable}
            className={`peer w-full border rounded-lg px-4 py-3 text-base appearance-none
              ${
                errorText
                  ? 'border-red-500'
                  : isFocused
                  ? 'border-green-700'
                  : 'border-gray-300'
              }
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700`}
            style={{ fontWeight }}
          >
            <option value="" hidden>
              Select {label}
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
          <label
            htmlFor={id}
            className={`absolute left-4 top-3 text-sm text-gray-500 bg-white px-1 transition-all 
              ${
                value || isFocused
                  ? '-translate-y-4 scale-75'
                  : 'translate-y-3 scale-100'
              }
              peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100
              peer-focus:-translate-y-4 peer-focus:scale-75`}
          >
            {label}
          </label>
        </>
      ) : (
        <>
          <input
            type={inputType}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=" "
            disabled={!isEditable}
            className={`peer w-full border rounded-lg px-4 py-3 text-base
              ${
                errorText
                  ? 'border-red-500'
                  : isFocused
                  ? 'border-green-700'
                  : 'border-gray-300'
              }
              focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700`}
            style={{ fontWeight }}
          />

          {label && (
            <label
              htmlFor={id}
              className={`absolute left-4 top-3 text-sm text-gray-500 bg-white px-1 transition-all 
                ${
                  value || isFocused
                    ? '-translate-y-4 scale-75'
                    : 'translate-y-3 scale-100'
                }
                peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100
                peer-focus:-translate-y-4 peer-focus:scale-75`}
            >
              {label}
            </label>
          )}

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility} // Toggle visibility
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {inputType === 'password' ? <FaEye /> : <FaEyeSlash />}
            </button>
          )}
        </>
      )}

      {icon && type !== 'select' && (
        <img
          src={icon}
          alt={`${label} icon`}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5"
        />
      )}

      {errorText && <p className="text-red-500 text-xs mt-1">{errorText}</p>}
    </div>
  );
};

export default Input;

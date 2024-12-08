/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

interface Props {
  title: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const Button: React.FC<Props> = ({ title, onClick, className = 'login-btn', type = 'button' }) => {
  return (
    <button type={type} className={className} onClick={onClick}>
      {title}
    </button>
  )
}

export default Button

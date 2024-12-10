import React from 'react'

const SelectField: React.FC<{
  text: string
  label: string
  icon: string
  onClickHandler: () => void
  isClickable: boolean
}> = (props) => {
  return (
    <button
      onClick={props.isClickable ? props.onClickHandler : undefined}
      className={`flex items-center justify-between border border-gray-400 rounded-lg px-4 py-3 mb-4 ${
        props.isClickable ? 'cursor-pointer' : 'cursor-default'
      }`}
      disabled={!props.isClickable}
    >
      <div className="flex-col text-start">
        <p className="text-xs text-gray-600 mb-1">{props.label}</p>
        <p className="text-md font-semibold mb-0">{props.text}</p>
      </div>
      {props.icon === '' ? <></> : <img src={props.icon} alt="" className="w-5 h-5" />}
    </button>
  )
}

export default SelectField

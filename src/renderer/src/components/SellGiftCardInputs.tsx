import React from 'react'
import SelectField from './SelectFIeld'
import { Icons } from '@renderer/constant/Icons'
interface SellGiftCardInputsProps {
  selectedService: string
}

const SellGiftCardInputs: React.FC<SellGiftCardInputsProps> = (props) => {
  const fields = [
    {
      id: '1',
      isClickable: false,
      icon: Icons.arrowDown,
      text: props.selectedService,
      label: 'Service Type',
      onClickHandler: () => null
    },
    {
      id: '2',
      isClickable: false,
      icon: Icons.arrowDown,
      text: 'Amazon',
      label: 'Gift Card Name',
      onClickHandler: () => null
    },
    {
      id: '3',
      isClickable: false,
      icon: Icons.arrowDown,
      text: 'Amazon Gift card',
      label: 'Gift card type',
      onClickHandler: () => null
    },
    {
      id: '4',
      isClickable: false,
      icon: Icons.arrowDown,
      text: 'United States',
      label: 'Gift card country',
      onClickHandler: () => null
    },
    {
      id: '5',
      isClickable: false,
      icon: Icons.arrowDown,
      text: 'E-code',
      label: 'Card Type',
      onClickHandler: () => null
    },
    {
      id: '6',
      isClickable: false,
      icon: '',
      text: '1cknfjn2394unfkcdwi2',
      label: 'Card Number',
      onClickHandler: () => null
    },
    {
      id: '7',
      isClickable: false,
      icon: '',
      text: '$100',
      label: 'Amount - Dollars',
      onClickHandler: () => null
    },
    {
      id: '8',
      isClickable: false,
      icon: '',
      text: 'NGN1700 / $1',
      label: 'Exchange Rate',
      onClickHandler: () => null
    },
    {
      id: '9',
      isClickable: false,
      icon: '',
      text: '170,000',
      label: 'Amount - Naira',
      onClickHandler: () => null
    },
    {
      id: '10',
      isClickable: true,
      icon: '',
      text: 'Dave',
      label: 'Name of Agent',
      onClickHandler: () => null
    }
  ]

  return (
    <div className="flex flex-col gap-4 overflow-auto px-4">
      {fields.map((field) => (
        <SelectField
          key={field.id}
          text={field.text}
          label={field.label}
          icon={field.icon}
          onClickHandler={field.onClickHandler}
          isClickable={field.isClickable}
        />
      ))}
    </div>
  )
}

export default SellGiftCardInputs

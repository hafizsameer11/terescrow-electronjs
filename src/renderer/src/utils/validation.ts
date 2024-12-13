import * as Yup from 'yup'
export const validationSignIn = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ),

  password: Yup.string().required('Password is required')
})

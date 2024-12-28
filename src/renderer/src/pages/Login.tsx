import { Images } from '@renderer/constant/Image'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import Input from '@renderer/utils/customInput'
import { validationSignIn } from '@renderer/utils/validation'
import { useMutation } from '@tanstack/react-query'
// import { toast } from 'react-toastify'
import { useAuth, UserRoles } from '@renderer/context/authContext'
import { loginUser } from '@renderer/mutation/commonMutation'
import { ApiError } from '@renderer/api/customApiCall'

const LoginPage = () => {
  const navigate = useNavigate()
  const { dispatch } = useAuth()

  const { mutate, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: loginUser,
    onSuccess: async (data) => {
      console.log(`API response: `, data.data)
      if (data?.token) {
        dispatch({ type: 'SET_TOKEN', payload: data?.token })
        dispatch({ type: 'SET_USER_DATA', payload: data.data })
        data.data.role === UserRoles.admin ? navigate('/dashboard') : navigate('/chats')
      } else {
        // toast.error(`Error: ${data?.message}`, {
        //   position: 'top-right',
        //   theme: 'colored',
        //   autoClose: 3000
        // })
      }
    },
    onError: (error: ApiError) => {
      // toast.error(`Error: ${error?.message || 'Failed to login'}`, {
      //   position: 'top-right',
      //   autoClose: 3000
      // })
    }
  })

  return (
    <div className=" w-full">
      <div>
        <img src={Images.logo} alt="" />
      </div>
      <div className="h-full w-full flex items-center justify-center">
        <div className="p-6 rounded-lg shadow-sm bg-white w-[450px] mt-10">
          <div className="mb-6">
            <h2 className="font-semibold text-2xl">Login</h2>
            <p>Login to your admin dashboard</p>
          </div>
          <div>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSignIn}
              onSubmit={(values) => {
                mutate(values)
              }}
            >
              {({ handleChange, handleBlur, values, errors, touched, handleSubmit }) => {
                return (
                  <Form>
                    <div>
                      <Input
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Email Address"
                        errorText={touched.email && errors.email ? errors.email : ''}
                        id="email"
                      />
                      <Input
                        id="password"
                        type="password"
                        showPasswordToggle
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Password"
                        errorText={touched.password && errors.password ? errors.password : ''}
                      />
                      <div>
                        <button
                          onClick={() => handleSubmit}
                          className="bg-green-600 hover:bg-green-700 w-full text-white font-bold py-2 px-4 rounded"
                          type="submit"
                        >
                          Login
                        </button>
                      </div>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

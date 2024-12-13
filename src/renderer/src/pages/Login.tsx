import { Images } from '@renderer/constant/Image'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'
import Input from '@renderer/utils/customInput'
import { validationSignIn } from '@renderer/utils/validation'
import { Icons } from '@renderer/constant/Icons'

const LoginPage = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/dashboard')
  }

  return (
    <div className=" w-full">
      <div>
        <img src={Images.logo} alt="" />
      </div>
      <div className="h-full w-full flex items-center justify-center">
        <div className="p-6 rounded-lg shadow-sm w-1/3  bg-white">
          <div className="mb-6">
            <h2 className="font-semibold text-2xl">Login</h2>
            <p>Login to your admin dashboard</p>
          </div>
          <div>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSignIn}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, values, errors, touched }) => {
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

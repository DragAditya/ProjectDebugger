import { useEffect } from "react";

type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if(user) {
      router.push("/");
    }
  }, [user]);

  const {handleSubmit: handleLoginSubmit} = loginForm;
  const {handleSubmit: handleRegisterSubmit} = registerForm;

  const handleLogin = async (data: LoginForm) => {
    await loginMutation.mutateAsync(data);
  }


  const handleRegister = async (data: RegisterForm) => {
    await registerMutation.mutateAsync(data);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>
        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...loginForm.register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 text-xs italic">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...loginForm.register("password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-xs italic">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                {...registerForm.register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {registerForm.formState.errors.name && (
                <p className="text-red-500 text-xs italic">
                  {registerForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...registerForm.register("email")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-500 text-xs italic">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-bold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...registerForm.register("password")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {registerForm.formState.errors.password && (
                <p className="text-red-500 text-xs italic">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-bold mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...registerForm.register("confirmPassword")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs italic">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Register
              </button>
            </div>
          </form>
        )}
        <p className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
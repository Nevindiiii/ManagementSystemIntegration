import React from 'react'
import { Eye, EyeOff, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react'

interface FormData {
    name: string;
    email: string;
    password: string;
}

interface LoginSignupProps {
    onLoginSuccess?: () => void;
    onClose?: () => void;
}

function loginsignup({ onLoginSuccess, onClose }: LoginSignupProps) {
    // state for login or register
    const [state, setState] = React.useState<"login" | "register">("login");

    // state for input value
    const [data, setData] = React.useState<FormData>({
        name: "",
        email: "",
        password: "",
    });
    
    // state for password visibility
    const [showPassword, setShowPassword] = React.useState(false);

    // handle change input value
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // handle submit form
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', { state, data });
        
        // Simulate authentication logic
        if (data.email && data.password) {
            if (state === "login") {
                // Simulate login success
                console.log('Login successful!');
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            } else {
                // Simulate registration success
                console.log('Registration successful!');
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            }
        }
        
        // Close modal if provided
        if (onClose) {
            onClose();
        }
    };
  return (
     <form
            onSubmit={handleSubmit}
            className="w-full sm:w-[350px] text-center border border-zinc-300/60 dark:border-zinc-700 rounded-2xl px-8 bg-white dark:bg-zinc-900"
        >
            <div className="flex flex-col items-center mt-8 mb-6">
                {state === "login" ? (
                    <LogIn className="w-12 h-12 text-indigo-500 mb-4" />
                ) : (
                    <UserPlus className="w-12 h-12 text-indigo-500 mb-4" />
                )}
                <h1 className="text-zinc-900 dark:text-white text-3xl font-medium">
                    {state === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
                    Please {state === "login" ? "sign in" : "sign up"} to continue
                </p>
            </div>

            {state !== "login" && (
                <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <User className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <input type="text" placeholder="Name" className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" name="name" value={data.name} onChange={onChangeHandler} required />
                </div>
            )}

            <div className="flex items-center w-full mt-4 bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 gap-2">
                <Mail className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <input type="email" placeholder="Email id" className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" name="email" value={data.email} onChange={onChangeHandler} required />
            </div>

            <div className="flex items-center mt-4 w-full bg-white dark:bg-zinc-800 border border-zinc-300/80 dark:border-zinc-700 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2">
                <Lock className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    className="bg-transparent text-zinc-600 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none text-sm w-full h-full" 
                    name="password" 
                    value={data.password} 
                    onChange={onChangeHandler} 
                    required 
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>

            <div className="mt-5 text-left">
                <a className="text-sm text-indigo-500 dark:text-indigo-400" href="#" >
                    Forgot password?
                </a>
            </div>

            <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity" >
                {state === "login" ? "Login" : "Create Account"}
            </button>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-3 mb-11">
                {state === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                <button type="button" className="text-indigo-500 dark:text-indigo-400" onClick={() => setState((prev) => prev === "login" ? "register" : "login")} >
                    {state === "login" ? "Register" : "Login"}
                </button>
            </p>
        </form>
  )
}

export default loginsignup

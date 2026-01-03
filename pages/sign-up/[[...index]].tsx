import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-500 mb-2">Sunnalytics</h1>
                    <p className="text-gray-400">Create your account</p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: 'w-full',
                            card: 'bg-gray-800 border border-gray-700 shadow-xl',
                        }
                    }}
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    afterSignUpUrl="/"
                />
            </div>
        </div>
    );
}

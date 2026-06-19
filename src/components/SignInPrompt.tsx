'use client';

import { signIn } from 'next-auth/react';
import { GoogleIcon } from './Icons';

export function SignInPrompt({ text }: { text: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl">🔒</span>
      <p className="mt-4 text-lg font-medium">{text}</p>
      <button
        onClick={() => signIn('google')}
        className="btn-primary mt-6"
      >
        <GoogleIcon />
        Войти через Google
      </button>
    </div>
  );
}

import AuthChoice from '@/plugins/authentication/components/AuthChoice';

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthChoice />
      </div>
    </div>
  );
}
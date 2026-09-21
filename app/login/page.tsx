import { LoginForm } from "@/components/forms/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-heading text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Demo player: <code>player@digitalheroes.test</code> / <code>HeroPlay!26</code>
        <br />
        Demo admin: <code>admin@digitalheroes.test</code> / <code>HeroAdmin!26</code>
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}

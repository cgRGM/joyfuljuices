import { Button } from "@joyfuljuices/ui/components/button";
import { Input } from "@joyfuljuices/ui/components/input";
import { Label } from "@joyfuljuices/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex justify-center mb-6 text-6xl">👋</div>
      <h1 className="mb-8 text-center text-4xl font-display font-bold text-foreground drop-shadow-sm">Welcome Back</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-3">
                <Label htmlFor={field.name} className="font-bold text-foreground">Email</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-xl">📧</span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-12 rounded-2xl h-14 border-2 border-border focus-visible:ring-primary focus-visible:border-primary shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-destructive font-bold text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-3">
                <Label htmlFor={field.name} className="font-bold text-foreground">Password</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-xl">🔒</span>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-12 rounded-2xl h-14 border-2 border-border focus-visible:ring-primary focus-visible:border-primary shadow-sm"
                    placeholder="Enter your password"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-destructive font-bold text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button 
               type="submit" 
               className="w-full h-14 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform" 
               disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Squeezing that out..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-border">
        <p className="text-muted-foreground mb-4 font-bold text-sm">New around here?</p>
        <Button
          variant="outline"
          onClick={onSwitchToSignUp}
          className="rounded-full w-full font-bold h-12"
        >
          Create an Account
        </Button>
      </div>
    </div>
  );
}

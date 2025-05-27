import AuthForm from "@/components/auth/AuthForm";

export default function ClientLoginPage() {
  return (
    <AuthForm
      userType="client"
      redirectPath="/client"
      title="Business Portal"
      description="Manage your competitions and engage with participants"
    />
  );
}

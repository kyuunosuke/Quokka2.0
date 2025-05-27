import AuthForm from "@/components/auth/AuthForm";

export default function MemberLoginPage() {
  return (
    <AuthForm
      userType="member"
      redirectPath="/member"
      title="Member Portal"
      description="Sign in to access competitions and track your progress"
    />
  );
}

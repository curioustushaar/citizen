import RoleLogin from '@/components/auth/RoleLogin';

export default function CitizenLoginPage() {
  return (
    <RoleLogin
      role="PUBLIC"
      title="Citizen Service Login"
      subtitle="Report, track, and resolve civic issues"
      redirectTo="/user/dashboard"
    />
  );
}

export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Profile</h3>

      <p><strong>Name:</strong> {profile.full_name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone:</strong> {profile.phone_number}</p>
      <p><strong>Role:</strong> {profile.role}</p>

      {profile.tenant && (
        <p><strong>Tenant:</strong> {profile.tenant}</p>
      )}
    </div>
  );
}

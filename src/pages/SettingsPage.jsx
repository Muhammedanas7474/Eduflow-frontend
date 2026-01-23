import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../store/slices/authSlice";
import { updateProfile, changePassword } from "../api/auth.api";

export default function SettingsPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // Profile Form
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState(null);

    // Password Form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setFullName(user.full_name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage(null);

        try {
            await updateProfile({ full_name: fullName, email });
            setProfileMessage({ type: "success", text: "Profile updated successfully!" });
            dispatch(fetchUserProfile());
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update profile";
            setProfileMessage({ type: "error", text: errorMsg });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage(null);

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "New passwords do not match" });
            setPasswordLoading(false);
            return;
        }

        try {
            await changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setPasswordMessage({ type: "success", text: "Password changed successfully!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to change password";
            setPasswordMessage({ type: "error", text: errorMsg });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-zinc-400 mt-2">Manage your account settings</p>
            </div>

            {/* Profile Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
                        <input
                            type="text"
                            value={user?.phone_number || ""}
                            disabled
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Phone number cannot be changed</p>
                    </div>

                    {profileMessage && (
                        <div className={`p-3 rounded-lg text-sm ${profileMessage.type === "success"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                            {profileMessage.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Enter new password"
                            minLength={6}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {passwordMessage && (
                        <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === "success"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                            {passwordMessage.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {passwordLoading ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Account Info */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                        <span className="text-zinc-500">Role</span>
                        <span className="text-emerald-500 font-medium">{user?.role}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                        <span className="text-zinc-500">Phone Verified</span>
                        <span className={user?.is_phone_verified ? "text-emerald-500" : "text-yellow-500"}>
                            {user?.is_phone_verified ? "Yes" : "No"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-zinc-500">Tenant</span>
                        <span className="text-white">{user?.tenant || "N/A"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

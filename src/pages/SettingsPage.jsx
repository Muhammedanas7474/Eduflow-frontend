import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../store/slices/authSlice";
import { updateProfile, changePassword } from "../api/auth.api";

// SVG Icons
const Icons = {
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    ),
    AlertContext: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    )
};

export default function SettingsPage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // active tab
    const [activeTab, setActiveTab] = useState("profile");

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
            setTimeout(() => setProfileMessage(null), 4000);
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
            setTimeout(() => setPasswordMessage(null), 4000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to change password";
            setPasswordMessage({ type: "error", text: errorMsg });
        } finally {
            setPasswordLoading(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: <Icons.User /> },
        { id: "security", label: "Security", icon: <Icons.Lock /> },
        { id: "account", label: "Account Info", icon: <Icons.Shield /> },
    ];

    return (
        <div className="min-h-screen text-white rounded-2xl relative pt-6 md:pt-10 pb-20 px-4 md:px-8">
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-emerald-900/20 to-transparent -z-10 rounded-t-2xl pointer-events-none" />

            <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                        Settings
                    </h1>
                    <p className="text-zinc-400 mt-2 text-lg">
                        Manage your account preferences and secure your profile.
                    </p>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 shrink-0">
                        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap ${isActive
                                                ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)] border border-emerald-500/20"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                                            }`}
                                    >
                                        <span className={`${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 relative">
                        {/* Profile Secion */}
                        <div
                            className={`transition-all duration-500 ${activeTab === 'profile' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0'}`}
                        >
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 md:p-8">
                                <div className="mb-8 border-b border-zinc-800 pb-6 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/20">
                                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                                        <p className="text-zinc-400 text-sm mt-1">Update your basic profile details.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                                    <div className="group">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors">Email Address</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div className="opacity-70">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center justify-between">
                                            Phone Number
                                            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">Read-only</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.phone_number || "Not set"}
                                            disabled
                                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>

                                    {profileMessage && (
                                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 ${profileMessage.type === "success"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                            <span className="mt-0.5">
                                                {profileMessage.type === "success" ? <Icons.Check /> : <Icons.AlertContext />}
                                            </span>
                                            {profileMessage.text}
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={profileLoading}
                                            className="relative overflow-hidden group px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {profileLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Saving...
                                                    </span>
                                                ) : "Save Changes"}
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div
                            className={`transition-all duration-500 ${activeTab === 'security' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0'}`}
                        >
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-6 md:p-8">
                                <div className="mb-8 border-b border-zinc-800 pb-6">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Icons.Lock /> Change Password
                                    </h2>
                                    <p className="text-zinc-400 text-sm mt-2">Ensure your account is using a long, random password to stay secure.</p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                                    <div className="group">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                                            placeholder="••••••••"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-medium text-zinc-300 mb-2 group-focus-within:text-emerald-400 transition-colors">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600 shadow-inner"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    {passwordMessage && (
                                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 ${passwordMessage.type === "success"
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                                            }`}>
                                            <span className="mt-0.5">
                                                {passwordMessage.type === "success" ? <Icons.Check /> : <Icons.AlertContext />}
                                            </span>
                                            {passwordMessage.text}
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="relative px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 hover:border-zinc-600 transform hover:-translate-y-0.5"
                                        >
                                            {passwordLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Changing...
                                                </span>
                                            ) : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Account Info Section */}
                        <div
                            className={`transition-all duration-500 ${activeTab === 'account' ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0'}`}
                        >
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden">
                                <div className="p-6 md:p-8 border-b border-zinc-800">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Icons.Shield /> System Record
                                    </h2>
                                    <p className="text-zinc-400 text-sm mt-2">Information about your current session and permissions.</p>
                                </div>
                                <div className="p-6 md:p-8">
                                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <dt className="text-sm font-medium text-zinc-500 mb-1">Account Role</dt>
                                            <dd className="text-lg font-semibold text-emerald-400 capitalize flex items-center gap-2">
                                                {user?.role || "Standard"}
                                            </dd>
                                        </div>
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                                            <dt className="text-sm font-medium text-zinc-500 mb-1">Verification Status</dt>
                                            <dd className="text-lg font-semibold flex items-center gap-2">
                                                {user?.is_phone_verified ? (
                                                    <span className="text-emerald-400 flex items-center gap-1"><Icons.Check /> Verified</span>
                                                ) : (
                                                    <span className="text-amber-500 flex items-center gap-1"><Icons.AlertContext /> Unverified</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 sm:col-span-2">
                                            <dt className="text-sm font-medium text-zinc-500 mb-1">Tenant Subdomain</dt>
                                            <dd className="text-lg font-mono text-white bg-zinc-900 inline-block px-3 py-1 rounded-md mt-1 border border-zinc-800">
                                                {user?.tenant || "global.system"}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CourseThumbnail - Generates aesthetic gradient placeholder for courses
 * Uses course ID to create consistent unique gradients
 */

const gradients = [
    "from-emerald-500 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-cyan-500 to-blue-500",
    "from-green-500 to-teal-500",
    "from-indigo-500 to-purple-500",
    "from-yellow-500 to-orange-500",
    "from-rose-500 to-pink-500",
];

export default function CourseThumbnail({
    courseId,
    title = "",
    className = "",
    size = "md"
}) {
    // Generate consistent gradient based on course ID
    const gradientIndex = courseId ? (courseId % gradients.length) : 0;
    const gradient = gradients[gradientIndex];

    // Size variants
    const sizeClasses = {
        sm: "h-10 w-16",
        md: "h-24 w-full",
        lg: "h-40 w-full",
    };

    // Get initials from title
    const getInitials = (text) => {
        if (!text) return "C";
        const words = text.split(" ").filter(Boolean);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return text.substring(0, 2).toUpperCase();
    };

    return (
        <div
            className={`
                bg-gradient-to-br ${gradient}
                ${sizeClasses[size] || sizeClasses.md}
                ${className}
                rounded-lg flex items-center justify-center
                relative overflow-hidden
            `}
        >
            {/* Pattern overlay for texture */}
            <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 40 40">
                    <pattern id={`pattern-${courseId}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="1" fill="white" />
                    </pattern>
                    <rect fill={`url(#pattern-${courseId})`} width="100%" height="100%" />
                </svg>
            </div>

            {/* Course initials */}
            <span className="relative text-white font-bold text-lg drop-shadow-lg">
                {getInitials(title)}
            </span>
        </div>
    );
}

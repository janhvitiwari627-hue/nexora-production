import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

type CustomerAvatarProps = {
  className?: string;
  iconClassName?: string;
};

export function CustomerAvatar({
  className = "h-10 w-10",
  iconClassName = "h-5 w-5",
}: CustomerAvatarProps) {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const [imageFailed, setImageFailed] = useState(false);

  const metadataAvatar =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;
  const avatarUrl = profile?.avatar_url || metadataAvatar;
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt={`${displayName || "Customer"} profile`}
        className={`${className} shrink-0 rounded-full object-cover ring-2 ring-violet-200`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      aria-label={`${displayName || "Customer"} profile`}
      className={`${className} grid shrink-0 place-items-center rounded-full bg-violet-100 font-black text-violet-700`}
    >
      {displayName ? initials : <UserRound className={iconClassName} />}
    </span>
  );
}

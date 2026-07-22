export type CustomerAvatarKey = "male" | "female" | "neutral";

const DEFAULT_CUSTOMER_AVATARS: Record<CustomerAvatarKey, string> = {
  male: "/default-customer-male.jpg",
  female: "/default-customer-female.jpg",
  neutral: "/customer-pwa-transparent-192.png?v=20260722-transparent-v4",
};

export function getCustomerAvatarKey(
  gender?: string | null,
  storedKey?: string | null,
): CustomerAvatarKey {
  if (storedKey === "male" || storedKey === "female" || storedKey === "neutral") {
    return storedKey;
  }
  if (gender === "male" || gender === "female") return gender;
  return "neutral";
}

export function getDefaultCustomerAvatarUrl(gender?: string | null, storedKey?: string | null) {
  return DEFAULT_CUSTOMER_AVATARS[getCustomerAvatarKey(gender, storedKey)];
}

export function getCustomerAvatarUrl({
  avatarUrl,
  gender,
  defaultAvatarKey,
}: {
  avatarUrl?: string | null;
  gender?: string | null;
  defaultAvatarKey?: string | null;
}) {
  return avatarUrl?.trim() || getDefaultCustomerAvatarUrl(gender, defaultAvatarKey);
}

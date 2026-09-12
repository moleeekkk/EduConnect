/**
 * Mask an email address for display privacy
 * e.g. "maulikdabhi@gmail.com" -> "mau***hi@gmail.com"
 * e.g. "alex.johnson@educonnect.ac.in" -> "ale***on@educonnect.ac.in"
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return "std***@educonnect.ac.in";
  }
  const parts = email.trim().split("@");
  const namePart = parts[0];
  const domainPart = parts.slice(1).join("@");

  if (namePart.length <= 2) {
    return namePart[0] + "***@" + domainPart;
  } else if (namePart.length <= 4) {
    return namePart.substring(0, 2) + "***@" + domainPart;
  } else {
    return namePart.substring(0, 3) + "***" + namePart.slice(-2) + "@" + domainPart;
  }
};

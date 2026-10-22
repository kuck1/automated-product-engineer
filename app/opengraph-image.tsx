import {
  createSocialImage,
  socialImageContentType,
  socialImageSize,
} from "@/src/marketing/social-image";

export const alt = "Auto - Beautiful features. In a day, not a week.";
export const contentType = socialImageContentType;
export const size = socialImageSize;

export default function OpenGraphImage() {
  return createSocialImage();
}

import {
  createSocialImage,
  socialImageContentType,
  socialImageSize,
} from "@/src/marketing/social-image";

export const alt = "Auto - AI coding, reliable enough for real products";
export const contentType = socialImageContentType;
export const size = socialImageSize;

export default function OpenGraphImage() {
  return createSocialImage();
}

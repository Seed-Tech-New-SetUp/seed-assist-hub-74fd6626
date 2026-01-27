import { getPortalToken } from "@/lib/utils/cookies";
import { decodeObjectStrings } from "@/lib/utils/decode-utf8";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/utils/auth-handler";

// ============ Types ============

export interface SchoolInfo {
  school_id?: string;
  school_name?: string;
  university?: string;
  about?: string;
  currency?: string;
  city?: string;
  state?: string;
  country?: string;
  school_banner?: string;
  school_logo?: string;
  graduate_phd_programs?: string;
  school_brochure_link?: string;
  international_students?: string;
  scholarship_amount?: string | null;
}

export interface SchoolInfoResponse {
  success: boolean;
  data?: {
    school: SchoolInfo;
  };
  error?: string;
}

export interface SchoolFAQ {
  faq_id?: string;
  question: string;
  answer: string;
  created_on?: string;
}

export interface SchoolFAQsResponse {
  success: boolean;
  data?: {
    faqs: SchoolFAQ[];
    count: number;
  };
  error?: string;
}

export interface SchoolSocialMedia {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SchoolSocialMediaResponse {
  success: boolean;
  data?: {
    social_media: SchoolSocialMedia;
  };
  error?: string;
}

// Features/USP types
export interface SchoolFeature {
  usp_id?: string;
  school_id?: string;
  usp_title: string;
  usp_description: string;
  usp_image_name?: string;
  usp_file_format?: string;
  created_on?: string;
  created_by?: string;
  is_approved_by?: string;
}

export interface SchoolFeaturesResponse {
  success: boolean;
  data?: {
    features: SchoolFeature[];
    count: number;
  };
  error?: string;
}

export interface FeatureMutationResponse {
  success: boolean;
  data?: {
    message: string;
    feature?: SchoolFeature;
    usp_id?: string;
  };
  error?: string;
}

// ============ API Helper ============

async function callSchoolProfileProxy<T>(
  action: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const queryParams = new URLSearchParams({ action });
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?${queryParams}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Check for unauthorized/expired token
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ============ School Info API ============

export async function fetchSchoolInfo(): Promise<SchoolInfo> {
  const result = await callSchoolProfileProxy<SchoolInfoResponse>("info", "GET");
  const info = result.data?.school || {};
  return decodeObjectStrings(info);
}

export async function saveSchoolInfo(info: Partial<SchoolInfo>): Promise<boolean> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  
  // Sanitize and add text fields
  for (const [key, value] of Object.entries(info)) {
    // Skip school_banner as it will be handled as imageUpload
    if (key === "school_banner") continue;
    
    const val = value as unknown;
    if (val === false || val === undefined || val === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(val));
    }
  }

  // Handle banner image upload with the field name "imageUpload"
  if (info.school_banner && info.school_banner.startsWith("data:")) {
    const blob = dataURLtoBlob(info.school_banner);
    formData.append("imageUpload", blob, "banner-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=info`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  return result.success;
}

// ============ FAQs API ============

export async function fetchSchoolFAQs(): Promise<SchoolFAQ[]> {
  const result = await callSchoolProfileProxy<SchoolFAQsResponse>("faqs", "GET");
  const faqs = result.data?.faqs || [];
  return decodeObjectStrings(faqs);
}

export async function saveSchoolFAQs(faqs: SchoolFAQ[]): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>(
    "faqs",
    "POST",
    { faqs }
  );
  return result.success;
}

// ============ Social Media API ============

export async function fetchSchoolSocialMedia(): Promise<SchoolSocialMedia> {
  const result = await callSchoolProfileProxy<SchoolSocialMediaResponse>("social", "GET");
  const socialMedia = result.data?.social_media || {};
  return decodeObjectStrings(socialMedia);
}

export async function saveSchoolSocialMedia(socialMedia: SchoolSocialMedia): Promise<boolean> {
  const result = await callSchoolProfileProxy<{ success: boolean }>(
    "social",
    "POST",
    socialMedia
  );
  return result.success;
}

// ============ Features API ============

export async function fetchSchoolFeatures(): Promise<SchoolFeature[]> {
  const result = await callSchoolProfileProxy<SchoolFeaturesResponse>("features-read", "GET");
  const features = result.data?.features || [];
  return decodeObjectStrings(features);
}

export async function createSchoolFeature(feature: {
  usp_title: string;
  usp_description: string;
  usp_image?: string; // base64 data URL
}): Promise<FeatureMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("usp_title", feature.usp_title);
  formData.append("usp_description", feature.usp_description);

  // Handle image upload if provided
  if (feature.usp_image && feature.usp_image.startsWith("data:")) {
    const blob = dataURLtoBlob(feature.usp_image);
    formData.append("usp_image", blob, "feature-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=features-create`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function updateSchoolFeature(feature: {
  usp_id: string;
  usp_title: string;
  usp_description: string;
  usp_image?: string; // base64 data URL (optional)
}): Promise<FeatureMutationResponse> {
  const token = getPortalToken();
  if (!token) {
    handleUnauthorized("No authentication token found");
  }

  const formData = new FormData();
  formData.append("usp_id", feature.usp_id);
  formData.append("usp_title", feature.usp_title);
  formData.append("usp_description", feature.usp_description);

  // Handle image upload if provided
  if (feature.usp_image && feature.usp_image.startsWith("data:")) {
    const blob = dataURLtoBlob(feature.usp_image);
    formData.append("usp_image", blob, "feature-image.jpg");
  }

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/school-profile-proxy?action=features-update`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (isUnauthorizedError(response.status, errorData)) {
      handleUnauthorized(errorData.error || errorData.message);
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function deleteSchoolFeature(uspId: string): Promise<FeatureMutationResponse> {
  const result = await callSchoolProfileProxy<FeatureMutationResponse>(
    "features-delete",
    "POST",
    { usp_id: uspId }
  );
  return result;
}

// Helper function to convert base64 data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

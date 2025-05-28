export interface UrlValidation {
  valid: boolean;
  error: string;
}

export function validateUrl(url: string): UrlValidation {
  if (!url.trim()) {
    return { valid: false, error: "Please enter a URL" };
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, error: "Only HTTP and HTTPS URLs are supported" };
    }
    return { valid: true, error: "" };
  } catch {
    return { valid: false, error: "Please enter a valid URL starting with http:// or https://" };
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  
  // Return empty for empty input
  if (!trimmed) {
    return "";
  }
  
  // Add protocol if missing
  if (!trimmed.match(/^https?:\/\//)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function isSecureUrl(url: string): boolean {
  return url.startsWith('https://');
}

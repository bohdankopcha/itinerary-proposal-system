import { useState } from "react";

export const useClientLink = (proposalId: string | null) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const url =
    proposalId === null
      ? ""
      : `${window.location.origin}/proposal/${proposalId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
    } catch {
      setCopiedUrl(null);
    }
  };

  return { url, copied: copiedUrl === url, copy };
};

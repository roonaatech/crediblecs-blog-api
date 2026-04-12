/**
 * Calculate estimated reading time for a blog post.
 * Average reading speed: 200-250 words per minute.
 * 
 * @param {string} content - The post content (HTML or plain text)
 * @returns {{ minutes: number, words: number }}
 */
export function calculateReadingTime(content) {
  if (!content) return { minutes: 0, words: 0 };

  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  // Count words
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length;

  // Average reading speed: 225 words per minute
  const minutes = Math.max(1, Math.ceil(words / 225));

  return { minutes, words };
}

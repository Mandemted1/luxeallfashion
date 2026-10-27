interface InstagramChild {
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  children?: { data: InstagramChild[] };
}

const MAX_IMAGES_PER_PRODUCT = 3;

// How far back a single discovery pass is willing to look per account.
// Deliberately well above a single page — an account that's gone a while
// between syncs shouldn't have its backlog silently fall outside the
// window forever. The per-pass new-row cap (DISCOVERY_LIMIT_PER_ACCOUNT
// in instagram-ingest.ts) is the actual flood guard, not this.
const MAX_POSTS_PER_ACCOUNT = 100;
const PAGE_SIZE = 25;

interface MediaPage {
  data?: InstagramPost[];
  paging?: { next?: string };
  error?: { message: string };
}

// Graph API with Facebook Login, via a never-expiring System User token —
// each Instagram Business Account is reached through its linked Facebook
// Page's Business Manager asset access, not a per-account OAuth token.
// Follows Graph API's own pagination (paging.next already carries every
// query param it needs, including the token) until either maxPosts is
// reached or the account runs out of posts.
export async function fetchInstagramPosts(
  accessToken: string,
  igAccountId: string,
  maxPosts: number = MAX_POSTS_PER_ACCOUNT,
): Promise<InstagramPost[]> {
  const fields = "id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}";
  let url: string | undefined =
    `https://graph.facebook.com/v21.0/${igAccountId}/media?fields=${fields}&limit=${PAGE_SIZE}&access_token=${accessToken}`;

  const posts: InstagramPost[] = [];
  while (url && posts.length < maxPosts) {
    const res = await fetch(url);
    const data: MediaPage = await res.json();
    if (data.error) throw new Error(data.error.message);
    posts.push(...(data.data ?? []));
    url = data.paging?.next;
  }

  return posts.slice(0, maxPosts);
}

// Fetches one specific post fresh, right before it's actually processed —
// media_url is a signed, expiring Instagram CDN link, so a URL captured
// at discovery time (which could be a while before a worker gets to it,
// if the queue is backed up) can't be trusted by then.
export async function fetchInstagramPost(
  accessToken: string,
  postId: string,
): Promise<InstagramPost> {
  const fields = "id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}";
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${postId}?fields=${fields}&access_token=${accessToken}`,
  );
  const data: InstagramPost & { error?: { message: string } } = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

// Picks up to MAX_IMAGES_PER_PRODUCT real photo URLs from a post — the
// client posts video/Reels fairly often, so anything video (whether the
// whole post or one slide of a carousel) is skipped rather than passed to
// the AI, which can't usefully parse a product out of a video frame here.
export function collectPostImageUrls(post: InstagramPost): string[] {
  if (post.media_type === "IMAGE" && post.media_url) {
    return [post.media_url];
  }
  if (post.media_type === "CAROUSEL_ALBUM" && post.children?.data) {
    return post.children.data
      .filter((child) => child.media_type === "IMAGE" && child.media_url)
      .map((child) => child.media_url!)
      .slice(0, MAX_IMAGES_PER_PRODUCT);
  }
  return [];
}

export async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image (${res.status}): ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Vision API cost scales with image size, not with how much detail the
// task actually needs — reading a price tag or telling a garment's
// color doesn't need Instagram's full-resolution upload. This shrinks a
// throwaway copy for the AI call only; the original buffer (full
// resolution) is what still gets uploaded to R2 and shown on the live
// product page, untouched.
export async function shrinkForAi(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp(buffer)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
}

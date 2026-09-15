import type { NewsletterSubscriber as PrismaNewsletterSubscriber } from "@luxe/database";

export interface AdminNewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  createdAt: Date;
}

export function mapAdminNewsletterSubscriber(
  subscriber: PrismaNewsletterSubscriber,
): AdminNewsletterSubscriber {
  return {
    id: subscriber.id,
    email: subscriber.email,
    source: subscriber.source,
    createdAt: subscriber.createdAt,
  };
}

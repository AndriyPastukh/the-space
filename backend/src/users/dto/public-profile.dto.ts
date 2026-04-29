export class PublicProfileDto {
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  status: string | null;
  location: {
    country: string | null;
    city: string | null;
  };
  socialLinks: {
    platform: string;
    url: string;
  }[];
  tags: {
    skills: string[];
    interests: string[];
  };
  categories: string[];
  stats: {
    rating: number;
    level: number;
    xpProgress: number;
    reputation: number;
  };
  badges: BadgeDto[];
  communities: CommunityDto[];
  portfolio: PortfolioItemDto[];
}

export class BadgeDto {
  name: string;
  iconUrl: string;
  description: string | null;
}

export class CommunityDto {
  name: string;
  slug: string;
  avatarUrl: string | null;
}

export class PortfolioItemDto {
  title: string;
  description: string | null;
  link: string | null;
}

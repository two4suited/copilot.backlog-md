export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conference extends BaseEntity {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  websiteUrl?: string;
  imageUrl?: string;
  timezone: string;
  trackCount: number;
  tracks?: Track[];
}

export interface ConferenceDetail extends Conference {
  tracks: Track[];
}

export interface Track extends BaseEntity {
  conferenceId: string;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  sessionCount: number;
  sessions?: Session[];
}

export interface TrackDetail extends Omit<Track, 'sessions'> {
  sessions: SessionSummary[];
}

export interface SessionSummary {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  capacity: number;
  sessionType: string;
  level: string;
  conferenceTimezone?: string;
}

export interface Speaker extends BaseEntity {
  name: string;
  bio: string;
  email: string;
  company: string;
  photoUrl?: string;
  twitterHandle?: string;
  linkedInUrl?: string;
}

export interface Session extends BaseEntity {
  trackId: string;
  track?: Track;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  room: string;
  seatsTotal: number;
  registrationCount: number;
  seatsAvailable: number;
  sessionType: string;
  level: string;
  slidesUrl?: string;
  recordingUrl?: string;
  speakers?: Speaker[];
  isRegistered?: boolean;
  conferenceTimezone?: string;
}

export interface SessionRating extends BaseEntity {
  stars: number;
  comment?: string;
}

export interface MyRatingDto {
  hasRated: boolean;
  rating?: SessionRating;
}

export interface StarDistribution {
  oneStar: number;
  twoStars: number;
  threeStars: number;
  fourStars: number;
  fiveStars: number;
}

export interface RatingSummaryDto {
  averageStars: number;
  totalRatings: number;
  distribution: StarDistribution;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'Attendee' | 'Speaker' | 'Admin';
  avatarUrl?: string;
}

export interface Registration extends BaseEntity {
  userId: string;
  sessionId: string;
  registeredAt: string;
  isWaitlisted: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

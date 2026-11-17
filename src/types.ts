export type Lang = "en" | "ar" | "tr";
export type Localized = Record<Lang, string>;

export type CategoryId = "tech" | "management" | "languages" | "design" | "finance";
export type CourseStatus = "running" | "upcoming" | "completed";
export type TraineeStatus = "active" | "inactive";
export type EnrollmentStatus = "paid" | "pending" | "cancelled";
export type Mode = "online" | "onsite";

export interface Person {
  ar: string;
  latin: string;
}

export interface Course {
  id: string;
  title: Localized;
  category: CategoryId;
  instructor: Person;
  mode: Mode;
  start: string; // ISO date
  weeks: number;
  capacity: number;
  enrolled: number;
  price: number; // SAR
  rating: number;
  status: CourseStatus;
}

export interface Trainee {
  id: string;
  name: Person;
  email: string;
  city: Localized;
  courses: number;
  progress: number; // 0-100
  lastActive: string; // ISO date
  status: TraineeStatus;
}

export interface Enrollment {
  id: string;
  traineeId: string;
  courseId: string;
  date: string;
  amount: number;
  status: EnrollmentStatus;
}

export interface Session {
  id: string;
  courseId: string;
  date: string; // ISO datetime
  room: Localized;
}

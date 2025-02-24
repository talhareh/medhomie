export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isApproved: boolean;
  testingBody: string;
  specialty: string;
  courseType: string;
}

export interface Filters {
  testingBodies: string[];
  specialties: string[];
  courseTypes: string[];
}

export interface ActiveFilters {
  testingBody: string[];
  specialty: string[];
  courseType: string[];
}

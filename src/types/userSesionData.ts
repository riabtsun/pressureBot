export interface Measurement {
  date: string;
  morning: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };
  evening: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };
}

export interface UserSessionData {
  step?:
    | "WAITING_NAME"
    | "WAITING_BIRTHDATE"
    | "EDIT_NAME"
    | "EDIT_BIRTHDATE"
    | "WAITING_MORNING_BP"
    | "WAITING_MORNING_PULSE"
    | "WAITING_EVENING_BP"
    | "WAITING_EVENING_PULSE"
    | null;
  userData?: {
    fullName?: string;
    birthDate?: string;
    records?: Measurement[];
  };
}

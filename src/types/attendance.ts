export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "leave";

export type Attendance = {
  id: string;
  worker_id: string;
  site_id: string | null;
  attendance_date: string;
  status: AttendanceStatus;
  amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceWithWorker = Attendance & {
  worker_name: string;
  worker_type: string;
  payment_type: "daily" | "monthly";
  wage: number;
  site_name: string | null;
};

export type AttendanceWorker = {
  id: string;
  name: string;
  worker_type: string;
  payment_type: "daily" | "monthly";
  wage: number;
  site_id: string | null;
  site_name: string | null;
  attendance_status: AttendanceStatus | null;
  attendance_amount: number | null;
};
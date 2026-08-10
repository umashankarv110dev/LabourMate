export type Worker = {
  id: string;
  name: string;
  phone: string;
  workerType: string;
  paymentType: "Daily" | "Monthly";
  wage: number;
  site: string;
  status: "Active" | "Inactive";
  initials: string;
};

export const demoWorkers: Worker[] = [
  {
    id: "1",
    name: "Ramesh Yadav",
    phone: "9876543210",
    workerType: "Mason",
    paymentType: "Daily",
    wage: 800,
    site: "Andheri Tower",
    status: "Active",
    initials: "RY",
  },
  {
    id: "2",
    name: "Suresh Kumar",
    phone: "9876543211",
    workerType: "Helper",
    paymentType: "Daily",
    wage: 500,
    site: "Andheri Tower",
    status: "Active",
    initials: "SK",
  },
  {
    id: "3",
    name: "Amit Sharma",
    phone: "9876543212",
    workerType: "Painter",
    paymentType: "Daily",
    wage: 700,
    site: "Borivali Project",
    status: "Active",
    initials: "AS",
  },
  {
    id: "4",
    name: "Rajesh Patel",
    phone: "9876543213",
    workerType: "Electrician",
    paymentType: "Daily",
    wage: 900,
    site: "Thane Renovation",
    status: "Active",
    initials: "RP",
  },
  {
    id: "5",
    name: "Mohan Singh",
    phone: "9876543214",
    workerType: "Carpenter",
    paymentType: "Daily",
    wage: 850,
    site: "Borivali Project",
    status: "Active",
    initials: "MS",
  },
];

export const demoSites = [
  {
    id: "1",
    name: "Andheri Tower",
    client: "Sharma Builders",
    location: "Andheri East, Mumbai",
    workers: 25,
    status: "Active",
    startDate: "01 Jun 2026",
  },
  {
    id: "2",
    name: "Borivali Project",
    client: "Patel Construction",
    location: "Borivali West, Mumbai",
    workers: 12,
    status: "Active",
    startDate: "15 Jun 2026",
  },
  {
    id: "3",
    name: "Thane Renovation",
    client: "Modern Homes",
    location: "Thane West",
    workers: 8,
    status: "Completed",
    startDate: "10 Apr 2026",
  },
];

export const demoPayments = [
  {
    id: "1",
    workerId: "1",
    workerName: "Ramesh Yadav",
    workingAmount: 18400,
    advance: 5000,
    finalAmount: 13400,
    status: "Pending",
  },
  {
    id: "2",
    workerId: "2",
    workerName: "Suresh Kumar",
    workingAmount: 12000,
    advance: 2000,
    finalAmount: 10000,
    status: "Pending",
  },
  {
    id: "3",
    workerId: "3",
    workerName: "Amit Sharma",
    workingAmount: 16800,
    advance: 0,
    finalAmount: 16800,
    status: "Paid",
  },
];

export const demoAdvances = [
  {
    id: "1",
    workerId: "1",
    workerName: "Ramesh Yadav",
    amount: 2000,
    date: "10 Jul 2026",
    mode: "Cash",
  },
  {
    id: "2",
    workerId: "1",
    workerName: "Ramesh Yadav",
    amount: 3000,
    date: "01 Jul 2026",
    mode: "UPI",
  },
  {
    id: "3",
    workerId: "2",
    workerName: "Suresh Kumar",
    amount: 2000,
    date: "05 Jul 2026",
    mode: "Cash",
  },
];
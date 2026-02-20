export type AtRiskCustomer = {
  id: string;
  name: string;
  riskScore: number;
  trigger: string;
  action: string;
  status: "Urgent" | "Pending" | "Contacted" | "Help Requested" | "Good Standing";
  requestedHelp: boolean;
  requestDate?: string;
  phone: string;
  email: string;
  loanAmount: string;
  missedPayments: number;
};

type TriggerTemplate = {
  label: string;
  scoreMin: number;
  scoreMax: number;
  action: string;
};

const TRIGGERS: TriggerTemplate[] = [
  {
    label: "SALARY DELAY",
    scoreMin: 86,
    scoreMax: 98,
    action: "Immediate Phone Intervention",
  },
  {
    label: "BOUNCED EMI",
    scoreMin: 84,
    scoreMax: 97,
    action: "Immediate Collections Outreach",
  },
  {
    label: "SAVINGS DEPLETION",
    scoreMin: 76,
    scoreMax: 94,
    action: "Soft Nudge SMS / Email",
  },
  {
    label: "LOAN APP SPIKE",
    scoreMin: 70,
    scoreMax: 90,
    action: "Financial Wellness Consult",
  },
  {
    label: "UTILIZATION SPIKE",
    scoreMin: 62,
    scoreMax: 86,
    action: "Credit Limit Review",
  },
  {
    label: "OVERDRAFT SPIKE",
    scoreMin: 60,
    scoreMax: 82,
    action: "Account Monitoring Call",
  },
  {
    label: "MINIMUM DUE ONLY",
    scoreMin: 55,
    scoreMax: 76,
    action: "Budget + Repayment Plan",
  },
  {
    label: "CASH WITHDRAWAL SPIKE",
    scoreMin: 52,
    scoreMax: 72,
    action: "Stress / Fraud Check-in",
  },
];

const LAST_NAMES = [
  "Sharma",
  "Singh",
  "Gupta",
  "Reddy",
  "Patel",
  "Kumar",
  "Iyer",
  "Nair",
  "Joshi",
  "Verma",
  "Mehta",
  "Bose",
  "Chatterjee",
  "Kulkarni",
  "Desai",
  "Bhat",
  "Mishra",
  "Saxena",
  "Kapoor",
  "Malhotra",
];

const FIRST_NAMES = [
  "Rajesh",
  "Anjali",
  "Neha",
  "Karthik",
  "Priya",
  "Amit",
  "Meera",
  "Vivek",
  "Rohan",
  "Sneha",
  "Arjun",
  "Ishita",
  "Rahul",
  "Pooja",
  "Suresh",
  "Kavya",
  "Manish",
  "Nikita",
  "Deepak",
  "Ayesha",
];

const ID_LETTERS = ["X", "B", "K", "P", "R", "M", "L", "T", "F", "D", "H", "G"];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function formatINR(amount: number): string {
  // Indian numbering with grouping: 12,34,567
  const s = Math.round(amount).toString();
  const last3 = s.slice(-3);
  const other = s.slice(0, -3);
  const withCommas = other.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${other ? `${withCommas},${last3}` : last3}`;
}

function makeEmail(first: string, last: string, rand: () => number): string {
  const domains = ["email.com", "bankmail.in", "finmail.in", "example.in"];
  const tag = randInt(rand, 1, 99).toString().padStart(2, "0");
  return `${first[0]}.${last}${tag}@${pick(rand, domains)}`.toLowerCase();
}

function makePhone(rand: () => number): string {
  // Keep it clearly mock-like but realistic-ish.
  const start = pick(rand, ["98", "97", "99", "96"]);
  const rest = randInt(rand, 10000000, 99999999).toString();
  return `+91 ${start}${rest.slice(0, 3)} ${rest.slice(3)}`;
}

function makeId(rand: () => number, used: Set<string>): string {
  for (let tries = 0; tries < 200; tries++) {
    const a = randInt(rand, 1000, 9999);
    const letter = pick(rand, ID_LETTERS);
    const b = randInt(rand, 1000, 9999);
    const id = `${a}-${letter}-${b}`;
    if (!used.has(id)) {
      used.add(id);
      return id;
    }
  }
  // Fallback (should never happen)
  const fallback = `${Date.now()}-X-0000`;
  used.add(fallback);
  return fallback;
}

function makeRequestDate(rand: () => number): string {
  // Feb 15–19, 2026
  const day = randInt(rand, 15, 19);
  const hours = randInt(rand, 8, 17);
  const mins = pick(rand, ["02", "08", "12", "19", "23", "35", "41", "47", "53"]);
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = ((hours + 11) % 12) + 1;
  return `Feb ${day}, 2026 ${hour12.toString().padStart(2, "0")}:${mins} ${ampm}`;
}

export function generateAtRiskCustomers(
  total: number,
  seed = 20260219
): AtRiskCustomer[] {
  const rand = mulberry32(seed);
  const usedIds = new Set<string>();

  const base: AtRiskCustomer[] = [
    {
      id: "8829-X-4421",
      name: "Sharma, Rajesh",
      riskScore: 92,
      trigger: "SALARY DELAY (4D)",
      action: "Immediate Phone Intervention",
      status: "Urgent",
      requestedHelp: true,
      requestDate: "Feb 16, 2026 09:23 AM",
      phone: "+91 98765 43210",
      email: "r.sharma@email.com",
      loanAmount: "₹16,17,000",
      missedPayments: 0,
    },
    {
      id: "1104-B-8923",
      name: "Singh, Anjali",
      riskScore: 88,
      trigger: "SAVINGS DEPLETION",
      action: "Soft Nudge SMS / Email",
      status: "Pending",
      requestedHelp: false,
      phone: "+91 98765 43213",
      email: "a.singh@email.com",
      loanAmount: "₹20,16,000",
      missedPayments: 0,
    },
    {
      id: "7732-K-0012",
      name: "Gupta, Neha",
      riskScore: 74,
      trigger: "LOAN APP SPIKE",
      action: "Financial Wellness Consult",
      status: "Pending",
      requestedHelp: false,
      phone: "+91 98765 43214",
      email: "n.gupta@email.com",
      loanAmount: "₹13,12,500",
      missedPayments: 0,
    },
    {
      id: "5543-P-2111",
      name: "Reddy, Karthik",
      riskScore: 68,
      trigger: "UTILIZATION SPIKE",
      action: "Credit Limit Review",
      status: "Contacted",
      requestedHelp: false,
      phone: "+91 98765 43215",
      email: "k.reddy@email.com",
      loanAmount: "₹9,34,500",
      missedPayments: 0,
    },
  ];

  for (const c of base) usedIds.add(c.id);

  const customers: AtRiskCustomer[] = [...base];

  while (customers.length < total) {
    const first = pick(rand, FIRST_NAMES);
    const last = pick(rand, LAST_NAMES);
    const name = `${last}, ${first}`;

    const template = pick(rand, TRIGGERS);
    const riskScore = randInt(rand, template.scoreMin, template.scoreMax);

    let trigger = template.label;
    if (template.label === "SALARY DELAY") {
      trigger = `SALARY DELAY (${randInt(rand, 2, 7)}D)`;
    }

    const requestedHelp = riskScore >= 90 ? rand() < 0.55 : riskScore >= 80 ? rand() < 0.25 : rand() < 0.08;

    let status: AtRiskCustomer["status"] = "Pending";
    if (requestedHelp) status = "Help Requested";
    else if (riskScore >= 90) status = "Urgent";
    else if (riskScore >= 75) status = "Pending";
    else status = rand() < 0.45 ? "Contacted" : "Pending";

    const missedPayments =
      template.label === "BOUNCED EMI"
        ? randInt(rand, 1, 2)
        : riskScore >= 92
        ? randInt(rand, 0, 1)
        : 0;

    const id = makeId(rand, usedIds);
    const phone = makePhone(rand);
    const email = makeEmail(first, last, rand);
    const loanAmount = formatINR(randInt(rand, 550000, 3200000));

    customers.push({
      id,
      name,
      riskScore,
      trigger,
      action: template.action,
      status,
      requestedHelp,
      requestDate: requestedHelp ? makeRequestDate(rand) : undefined,
      phone,
      email,
      loanAmount,
      missedPayments,
    });
  }

  // Sort by risk so the table feels like a priority queue.
  customers.sort((a, b) => b.riskScore - a.riskScore);

  return customers;
}

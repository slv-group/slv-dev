import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { IndianRupee, Percent, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/data/projects";

export const Route = createFileRoute("/emi-calculator")({
  head: () => ({
    meta: [
      { title: "EMI Calculator — SLV Group" },
      {
        name: "description",
        content:
          "Plan your home loan with our interactive EMI calculator. Estimate monthly EMI, total interest, and total payable instantly.",
      },
      { property: "og:title", content: "Home Loan EMI Calculator — SLV Group" },
      {
        property: "og:description",
        content: "Estimate your monthly EMI, interest, and total amount in seconds.",
      },
    ],
  }),
  component: EMICalculator,
});

function NeuSlider({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  icon: typeof Percent;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-3xl bg-background p-6 neu">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4 text-gold" /> {label}
        </span>
        <span className="font-display text-xl font-bold text-foreground">{format(value)}</span>
      </div>
      <div className="relative mt-5 h-3 rounded-full neu-pressed">
        <div
          className="absolute left-0 top-0 h-3 rounded-full bg-gradient-gold"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-[3px_3px_6px_#bcbdc1,-3px_-3px_6px_#ffffff] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-background"
        />
      </div>
    </div>
  );
}

function EMICalculator() {
  const [amount, setAmount] = useState(15000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [showAll, setShowAll] = useState(false);

  const { emi, totalInterest, total, principalPct, schedule } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    const emiVal = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalVal = emiVal * n;
    const interest = totalVal - amount;

    const schedule: {
      month: number;
      emi: number;
      principal: number;
      interest: number;
      balance: number;
    }[] = [];
    let balance = amount;
    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * r;
      const principalPayment = emiVal - interestPayment;

      balance -= principalPayment;

      schedule.push({
        month,
        emi: emiVal,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(balance, 0),
      });
    }
    return {
      emi: emiVal,
      totalInterest: interest,
      total: totalVal,
      principalPct: (amount / totalVal) * 100,
      schedule,
    };
  }, [amount, rate, years]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const principalDash = (principalPct / 100) * circumference;

  return (
    <div className="pt-32">
      <div className="mx-auto max-w-7xl px-2 md:px-6">
        <div className="text-center">
          <p className="section-label text-gold">Plan Your Investment</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground sm:text-6xl">
            EMI Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Adjust the sliders to estimate your monthly home loan instalment in real time.
          </p>
        </div>

        <div className="mt-14 grid gap-8 pb-12 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-5">
            <NeuSlider
              label="Loan Amount"
              icon={IndianRupee}
              value={amount}
              min={1000000}
              max={100000000}
              step={500000}
              onChange={setAmount}
              format={formatCurrency}
            />
            <NeuSlider
              label="Interest Rate"
              icon={Percent}
              value={rate}
              min={5}
              max={15}
              step={0.1}
              onChange={setRate}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <NeuSlider
              label="Loan Tenure"
              icon={CalendarClock}
              value={years}
              min={1}
              max={30}
              step={1}
              onChange={setYears}
              format={(v) => `${v} Years`}
            />
          </div>

          {/* Dashboard */}
          <div className="rounded-3xl bg-background p-8 neu">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeWidth="22"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="oklch(0.18 0.005 270)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray={`${principalDash} ${circumference}`}
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference - principalDash} ${circumference}`}
                    strokeDashoffset={-principalDash}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Monthly EMI
                  </span>
                  <span className="font-display text-2xl font-bold text-foreground">
                    ₹{Math.round(emi).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-3 w-3 rounded-full bg-primary" /> Principal
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-3 w-3 rounded-full bg-gold" /> Interest
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[
                ["Principal Amount", formatCurrency(amount)],
                ["Total Interest", formatCurrency(totalInterest)],
                ["Total Amount Payable", formatCurrency(total)],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="flex items-center justify-between rounded-2xl bg-background px-5 py-4 neu-pressed"
                >
                  <span className="text-sm text-muted-foreground">{l}</span>
                  <span className="font-display text-lg font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Amortization Schedule */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-background neu">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h2 className="font-display text-2xl font-bold">Repayment Schedule</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Breakdown of principal and interest payments over time.
            </p>
          </div>

          {/* Scrollable table */}
          <div
            className="
      max-h-[500px]
      overflow-auto
      rounded-b-3xl
      [scrollbar-width:thin]
      mb-5
    "
          >
            <table className="w-full min-w-[700px] text-center">
              <thead className="sticky top-0 z-10 border-b border-border bg-secondary/95 backdrop-blur-md">
                <tr>
                  <th className="border-r border-border px-4 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Month
                  </th>

                  <th className="border-r border-border px-4 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    EMI
                  </th>

                  <th className="border-r border-border px-4 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Principal
                  </th>

                  <th className="border-r border-border px-4 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Interest
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {schedule.slice(0, showAll ? schedule.length : 12).map((item) => (
                  <tr
                    key={item.month}
                    className="border-b border-border transition-colors duration-200 hover:bg-secondary/20"
                  >
                    <td className="border-r border-border px-4 py-4">{item.month}</td>

                    <td className="border-r border-border px-4 py-4">{formatCurrency(item.emi)}</td>

                    <td className="border-r border-border px-4 py-4 font-medium text-green-600">
                      {formatCurrency(item.principal)}
                    </td>

                    <td className="border-r border-border px-4 py-4 font-medium text-gold">
                      {formatCurrency(item.interest)}
                    </td>

                    <td className="px-4 py-4 font-medium">{formatCurrency(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule controls */}
        <div className="flex justify-center p-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-xl bg-gradient-gold px-5 py-3 font-semibold text-gold-foreground transition-all duration-300 hover:-translate-y-0.5"
          >
            {showAll ? "Show Less" : "View Full Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

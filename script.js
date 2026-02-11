const contributionPeriodsPerYear = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

const compoundingPeriodsPerYear = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const form = document.getElementById("calculator-form");

function annualGrowthFactor(rateDecimal, compoundingType) {
  if (compoundingType === "continuous") {
    return Math.exp(rateDecimal);
  }

  const n = compoundingPeriodsPerYear[compoundingType];
  return (1 + rateDecimal / n) ** n;
}

function calculateProjection({
  initial,
  annualRatePercent,
  years,
  contribution,
  contributionFrequency,
  contributionTiming,
  compounding,
}) {
  const rateDecimal = annualRatePercent / 100;
  const contributionPeriods = contributionPeriodsPerYear[contributionFrequency];
  const totalPeriods = Math.round(years * contributionPeriods);
  const dtYears = 1 / contributionPeriods;
  const periodGrowth = annualGrowthFactor(rateDecimal, compounding) ** dtYears;

  let balance = initial;
  let totalContributions = initial;

  for (let i = 0; i < totalPeriods; i += 1) {
    if (contributionTiming === "beginning") {
      balance += contribution;
      totalContributions += contribution;
    }

    balance *= periodGrowth;

    if (contributionTiming === "end") {
      balance += contribution;
      totalContributions += contribution;
    }
  }

  // Handle fractional year remainder for smooth year values like 10.5
  const fractionalYears = years - totalPeriods / contributionPeriods;
  if (fractionalYears > 0) {
    balance *= annualGrowthFactor(rateDecimal, compounding) ** fractionalYears;
  }

  const totalInterest = balance - totalContributions;

  return {
    futureValue: balance,
    totalContributions,
    totalInterest,
    periods: totalPeriods,
  };
}

function updateResults(result, years, contributionFrequency, compounding) {
  document.getElementById("future-value").textContent = formatter.format(result.futureValue);
  document.getElementById("total-contributions").textContent = formatter.format(
    result.totalContributions,
  );
  document.getElementById("total-interest").textContent = formatter.format(result.totalInterest);

  const compoundingLabel = compounding === "continuous" ? "continuous" : compounding;
  document.getElementById(
    "summary",
  ).textContent = `Over ${years} years, your ${contributionFrequency} strategy grows across ${result.periods} contribution periods using ${compoundingLabel} compounding assumptions.`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    initial: Number(document.getElementById("initial").value),
    annualRatePercent: Number(document.getElementById("rate").value),
    years: Number(document.getElementById("years").value),
    contribution: Number(document.getElementById("contribution").value),
    contributionFrequency: document.getElementById("contribution-frequency").value,
    contributionTiming: document.getElementById("contribution-timing").value,
    compounding: document.getElementById("compounding").value,
  };

  const result = calculateProjection(payload);
  updateResults(result, payload.years, payload.contributionFrequency, payload.compounding);
});

form.dispatchEvent(new Event("submit"));

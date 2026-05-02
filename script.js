const fields = {
  teamSize: document.getElementById("teamSize"),
  salary: document.getElementById("salary"),
  burden: document.getElementById("burden"),
  attrition: document.getElementById("attrition"),
  management: document.getElementById("management"),
  aiPlatform: document.getElementById("aiPlatform"),
  aiUsage: document.getElementById("aiUsage"),
  hitl: document.getElementById("hitl"),
  implementation: document.getElementById("implementation"),
  automation: document.getElementById("automation"),
  lift: document.getElementById("lift"),
  rework: document.getElementById("rework"),
};

const outputs = {
  employeeAnnual: document.getElementById("employeeAnnual"),
  aiAnnual: document.getElementById("aiAnnual"),
  annualSavings: document.getElementById("annualSavings"),
  payback: document.getElementById("payback"),
  breakEven: document.getElementById("breakEven"),
  capacity: document.getElementById("capacity"),
  employeeBar: document.getElementById("employeeBar"),
  aiBar: document.getElementById("aiBar"),
  savingsBar: document.getElementById("savingsBar"),
  insight: document.getElementById("insight"),
};

const presets = {
  support: {
    teamSize: 12,
    salary: 4800,
    burden: 30,
    attrition: 15,
    management: 18,
    aiPlatform: 7600,
    aiUsage: 4200,
    hitl: 3200,
    implementation: 26000,
    automation: 68,
    lift: 26,
    rework: 10,
  },
  sdr: {
    teamSize: 8,
    salary: 6500,
    burden: 28,
    attrition: 12,
    management: 14,
    aiPlatform: 6500,
    aiUsage: 3000,
    hitl: 2100,
    implementation: 22000,
    automation: 55,
    lift: 30,
    rework: 8,
  },
  backoffice: {
    teamSize: 10,
    salary: 5200,
    burden: 27,
    attrition: 10,
    management: 13,
    aiPlatform: 8200,
    aiUsage: 3600,
    hitl: 2800,
    implementation: 24000,
    automation: 60,
    lift: 24,
    rework: 7,
  },
  content: {
    teamSize: 6,
    salary: 6000,
    burden: 26,
    attrition: 9,
    management: 12,
    aiPlatform: 4800,
    aiUsage: 2400,
    hitl: 1700,
    implementation: 18000,
    automation: 52,
    lift: 34,
    rework: 11,
  },
};

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function assignPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  Object.entries(preset).forEach(([key, value]) => {
    fields[key].value = value;
  });

  update();
}

function update() {
  const teamSize = Math.max(1, safeNumber(fields.teamSize.value, 1));
  const salary = Math.max(0, safeNumber(fields.salary.value));
  const burden = clamp(safeNumber(fields.burden.value) / 100, 0, 2);
  const attrition = clamp(safeNumber(fields.attrition.value) / 100, 0, 1);
  const management = clamp(safeNumber(fields.management.value) / 100, 0, 1);
  const aiPlatform = Math.max(0, safeNumber(fields.aiPlatform.value));
  const aiUsage = Math.max(0, safeNumber(fields.aiUsage.value));
  const hitl = Math.max(0, safeNumber(fields.hitl.value));
  const implementation = Math.max(0, safeNumber(fields.implementation.value));
  const automation = clamp(safeNumber(fields.automation.value) / 100, 0, 1);
  const lift = clamp(safeNumber(fields.lift.value) / 100, 0, 1);
  const rework = clamp(safeNumber(fields.rework.value) / 100, 0, 1);

  const baseMonthlyLabor = teamSize * salary;
  const fullyLoadedMonthlyLabor = baseMonthlyLabor * (1 + burden + attrition + management);
  const annualEmployeeTco = fullyLoadedMonthlyLabor * 12;

  const monthlyAiProgram = aiPlatform + aiUsage + hitl;
  const annualAiProgram = monthlyAiProgram * 12 + implementation;

  const residualWorkFactor = 1 - automation;
  const qualityPenaltyFactor = 1 + rework;
  const productivityFactor = 1 + lift;

  const effectiveHumanCapacityGain = ((automation + residualWorkFactor * lift) * (1 - rework)) * 100;

  const adjustedAiEquivalentLaborCost =
    fullyLoadedMonthlyLabor * residualWorkFactor * qualityPenaltyFactor / productivityFactor;

  const aiProgramWithResidualLabor = annualAiProgram + adjustedAiEquivalentLaborCost * 12;
  const annualSavings = annualEmployeeTco - aiProgramWithResidualLabor;

  const monthlySavings = fullyLoadedMonthlyLabor - (monthlyAiProgram + adjustedAiEquivalentLaborCost);
  const paybackMonths = monthlySavings > 0 ? implementation / monthlySavings : null;
  const breakEvenMonths = paybackMonths !== null ? Math.ceil(paybackMonths) : null;

  outputs.employeeAnnual.textContent = money(annualEmployeeTco);
  outputs.aiAnnual.textContent = money(aiProgramWithResidualLabor);
  outputs.annualSavings.textContent = money(annualSavings);
  outputs.payback.textContent = paybackMonths !== null ? `${paybackMonths.toFixed(1)} months` : "No payback";
  outputs.breakEven.textContent = breakEvenMonths !== null ? `Month ${breakEvenMonths}` : "Not reached";
  outputs.capacity.textContent = `${Math.max(0, effectiveHumanCapacityGain).toFixed(0)}%`;

  outputs.annualSavings.classList.toggle("positive", annualSavings >= 0);
  outputs.annualSavings.classList.toggle("negative", annualSavings < 0);

  const max = Math.max(annualEmployeeTco, aiProgramWithResidualLabor, Math.abs(annualSavings), 1);
  outputs.employeeBar.style.width = `${(annualEmployeeTco / max) * 100}%`;
  outputs.aiBar.style.width = `${(aiProgramWithResidualLabor / max) * 100}%`;
  outputs.savingsBar.style.width = `${(Math.abs(annualSavings) / max) * 100}%`;

  if (annualSavings >= 0) {
    outputs.insight.textContent = `AI-led delivery saves ${money(annualSavings)} annually with break-even ${outputs.breakEven.textContent.toLowerCase()} under current assumptions.`;
  } else {
    outputs.insight.textContent = `Current assumptions show a ${money(Math.abs(annualSavings))} annual gap. Improve automation suitability, reduce rework, or lower AI stack costs.`;
  }
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
});

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => {
    assignPreset(button.dataset.preset);
  });
});

update();

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
  monthlyVolume: document.getElementById("monthlyVolume"),
  minutesPerTask: document.getElementById("minutesPerTask"),
};

const outputs = {
  employeeAnnual: document.getElementById("employeeAnnual"),
  aiAnnual: document.getElementById("aiAnnual"),
  annualSavings: document.getElementById("annualSavings"),
  payback: document.getElementById("payback"),
  breakEven: document.getElementById("breakEven"),
  roi: document.getElementById("roi"),
  capacity: document.getElementById("capacity"),
  monthlySavings: document.getElementById("monthlySavings"),
  threeYearBenefit: document.getElementById("threeYearBenefit"),
  conservativeSavings: document.getElementById("conservativeSavings"),
  baseSavings: document.getElementById("baseSavings"),
  upsideSavings: document.getElementById("upsideSavings"),
  confidenceScore: document.getElementById("confidenceScore"),
  requiredAutomation: document.getElementById("requiredAutomation"),
  maxAiMonthly: document.getElementById("maxAiMonthly"),
  riskFlag: document.getElementById("riskFlag"),
  breakEvenVolume: document.getElementById("breakEvenVolume"),
  humanCostPerTask: document.getElementById("humanCostPerTask"),
  aiCostPerTask: document.getElementById("aiCostPerTask"),
  aiCostPerMinute: document.getElementById("aiCostPerMinute"),
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
    monthlyVolume: 42000,
    minutesPerTask: 7,
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
    monthlyVolume: 16000,
    minutesPerTask: 5,
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
    monthlyVolume: 22000,
    minutesPerTask: 6.5,
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
    monthlyVolume: 12000,
    minutesPerTask: 8,
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

function moneyPrecise(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateAnnualSavings(inputs) {
  const baseMonthlyLabor = inputs.teamSize * inputs.salary;
  const fullyLoadedMonthlyLabor =
    baseMonthlyLabor * (1 + inputs.burden + inputs.attrition + inputs.management);
  const annualEmployeeTco = fullyLoadedMonthlyLabor * 12;

  const monthlyAiProgram = inputs.aiPlatform + inputs.aiUsage + inputs.hitl;
  const annualAiProgram = monthlyAiProgram * 12 + inputs.implementation;

  const residualWorkFactor = 1 - inputs.automation;
  const qualityPenaltyFactor = 1 + inputs.rework;
  const productivityFactor = 1 + inputs.lift;

  const adjustedAiEquivalentLaborCost =
    (fullyLoadedMonthlyLabor * residualWorkFactor * qualityPenaltyFactor) / productivityFactor;
  const aiProgramWithResidualLabor = annualAiProgram + adjustedAiEquivalentLaborCost * 12;

  return {
    annualEmployeeTco,
    aiProgramWithResidualLabor,
    annualSavings: annualEmployeeTco - aiProgramWithResidualLabor,
    monthlyAiProgram,
    fullyLoadedMonthlyLabor,
    adjustedAiEquivalentLaborCost,
  };
}

function requiredAutomationForBreakEven(inputs) {
  const { teamSize, salary, burden, attrition, management, aiPlatform, aiUsage, hitl, implementation, lift, rework } = inputs;
  const baseMonthlyLabor = teamSize * salary;
  const fullyLoadedMonthlyLabor =
    baseMonthlyLabor * (1 + burden + attrition + management);
  const annualEmployeeTco = fullyLoadedMonthlyLabor * 12;
  const annualAiBase = (aiPlatform + aiUsage + hitl) * 12 + implementation;
  const laborCostWithoutAutomation =
    (fullyLoadedMonthlyLabor * (1 + rework) * 12) / (1 + lift);

  if (laborCostWithoutAutomation <= 0) {
    return 1;
  }

  const ratio = (annualEmployeeTco - annualAiBase) / laborCostWithoutAutomation;
  return clamp(1 - ratio, 0, 1);
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
  const monthlyVolume = Math.max(1, safeNumber(fields.monthlyVolume.value, 1));
  const minutesPerTask = Math.max(0.1, safeNumber(fields.minutesPerTask.value, 0.1));

  const effectiveHumanCapacityGain = (automation + (1 - automation) * lift) * (1 - rework) * 100;

  const base = calculateAnnualSavings({
    teamSize,
    salary,
    burden,
    attrition,
    management,
    aiPlatform,
    aiUsage,
    hitl,
    implementation,
    automation,
    lift,
    rework,
  });

  const annualEmployeeTco = base.annualEmployeeTco;
  const aiProgramWithResidualLabor = base.aiProgramWithResidualLabor;
  const annualSavings = base.annualSavings;

  const monthlySavings =
    base.fullyLoadedMonthlyLabor - (base.monthlyAiProgram + base.adjustedAiEquivalentLaborCost);
  const paybackMonths = monthlySavings > 0 ? implementation / monthlySavings : null;
  const breakEvenMonths = paybackMonths !== null ? Math.ceil(paybackMonths) : null;
  const yearOneRoi = aiProgramWithResidualLabor > 0 ? (annualSavings / aiProgramWithResidualLabor) * 100 : 0;
  const threeYearBenefit = annualSavings * 3;

  const conservative = calculateAnnualSavings({
    teamSize,
    salary,
    burden,
    attrition,
    management,
    aiPlatform,
    aiUsage: aiUsage * 1.15,
    hitl,
    implementation,
    automation: clamp(automation * 0.85, 0, 1),
    lift: clamp(lift * 0.9, 0, 1),
    rework: clamp(rework * 1.25, 0, 1),
  });

  const upside = calculateAnnualSavings({
    teamSize,
    salary,
    burden,
    attrition,
    management,
    aiPlatform,
    aiUsage: aiUsage * 0.9,
    hitl,
    implementation,
    automation: clamp(automation * 1.1, 0, 1),
    lift: clamp(lift * 1.15, 0, 1),
    rework: clamp(rework * 0.8, 0, 1),
  });

  const maxAffordableAiMonthly =
    base.fullyLoadedMonthlyLabor - base.adjustedAiEquivalentLaborCost + implementation / 12;
  const humanCostPerTask = base.fullyLoadedMonthlyLabor / monthlyVolume;
  const aiCostPerTask =
    (base.monthlyAiProgram + base.adjustedAiEquivalentLaborCost) / monthlyVolume;
  const aiCostPerMinute = aiCostPerTask / minutesPerTask;
  const breakEvenVolume =
    humanCostPerTask > aiCostPerTask ? implementation / (humanCostPerTask - aiCostPerTask) : null;
  const requiredAutomation = requiredAutomationForBreakEven({
    teamSize,
    salary,
    burden,
    attrition,
    management,
    aiPlatform,
    aiUsage,
    hitl,
    implementation,
    lift,
    rework,
  });

  let confidenceScore = 55;
  if (annualSavings > 0) confidenceScore += 15;
  if (conservative.annualSavings > 0) confidenceScore += 10;
  if (paybackMonths !== null && paybackMonths <= 12) confidenceScore += 10;
  if (paybackMonths !== null && paybackMonths <= 6) confidenceScore += 5;
  if (rework <= 0.1) confidenceScore += 5;
  if (automation >= 0.6) confidenceScore += 5;
  if (annualSavings < 0) confidenceScore -= 20;
  if (conservative.annualSavings < 0) confidenceScore -= 10;
  confidenceScore = clamp(confidenceScore, 0, 100);

  let riskFlag = "Stable";
  if (conservative.annualSavings < 0 || paybackMonths === null) {
    riskFlag = "High";
  } else if (paybackMonths > 12 || confidenceScore < 60) {
    riskFlag = "Medium";
  }

  outputs.employeeAnnual.textContent = money(annualEmployeeTco);
  outputs.aiAnnual.textContent = money(aiProgramWithResidualLabor);
  outputs.annualSavings.textContent = money(annualSavings);
  outputs.payback.textContent = paybackMonths !== null ? `${paybackMonths.toFixed(1)} months` : "No payback";
  outputs.breakEven.textContent = breakEvenMonths !== null ? `Month ${breakEvenMonths}` : "Not reached";
  outputs.roi.textContent = `${yearOneRoi.toFixed(0)}%`;
  outputs.capacity.textContent = `${Math.max(0, effectiveHumanCapacityGain).toFixed(0)}%`;
  outputs.monthlySavings.textContent = money(monthlySavings);
  outputs.threeYearBenefit.textContent = money(threeYearBenefit);

  outputs.conservativeSavings.textContent = money(conservative.annualSavings);
  outputs.baseSavings.textContent = money(annualSavings);
  outputs.upsideSavings.textContent = money(upside.annualSavings);
  outputs.confidenceScore.textContent = `${confidenceScore.toFixed(0)}/100`;
  outputs.requiredAutomation.textContent = `${(requiredAutomation * 100).toFixed(0)}%`;
  outputs.maxAiMonthly.textContent = money(Math.max(0, maxAffordableAiMonthly));
  outputs.riskFlag.textContent = riskFlag;
  outputs.breakEvenVolume.textContent =
    breakEvenVolume !== null ? `${Math.ceil(breakEvenVolume).toLocaleString("en-US")}` : "Not reached";
  outputs.humanCostPerTask.textContent = moneyPrecise(humanCostPerTask);
  outputs.aiCostPerTask.textContent = moneyPrecise(aiCostPerTask);
  outputs.aiCostPerMinute.textContent = moneyPrecise(aiCostPerMinute);

  outputs.annualSavings.classList.toggle("positive", annualSavings >= 0);
  outputs.annualSavings.classList.toggle("negative", annualSavings < 0);
  outputs.monthlySavings.classList.toggle("positive", monthlySavings >= 0);
  outputs.monthlySavings.classList.toggle("negative", monthlySavings < 0);
  outputs.threeYearBenefit.classList.toggle("positive", threeYearBenefit >= 0);
  outputs.threeYearBenefit.classList.toggle("negative", threeYearBenefit < 0);
  outputs.riskFlag.classList.toggle("positive", riskFlag === "Stable");
  outputs.riskFlag.classList.toggle("negative", riskFlag === "High");

  const max = Math.max(annualEmployeeTco, aiProgramWithResidualLabor, Math.abs(annualSavings), 1);
  outputs.employeeBar.style.width = `${(annualEmployeeTco / max) * 100}%`;
  outputs.aiBar.style.width = `${(aiProgramWithResidualLabor / max) * 100}%`;
  outputs.savingsBar.style.width = `${(Math.abs(annualSavings) / max) * 100}%`;

  if (annualSavings >= 0) {
    outputs.insight.textContent = `AI-led delivery saves ${money(annualSavings)} annually (${money(monthlySavings)} per month), reaches break-even ${outputs.breakEven.textContent.toLowerCase()}, and delivers ${yearOneRoi.toFixed(0)}% Year-1 ROI. Unit economics improve from ${moneyPrecise(humanCostPerTask)} to ${moneyPrecise(aiCostPerTask)} per task with AI cost around ${moneyPrecise(aiCostPerMinute)} per minute. Confidence score: ${confidenceScore.toFixed(0)}/100.`;
  } else {
    outputs.insight.textContent = `Current assumptions show a ${money(Math.abs(annualSavings))} annual gap. Improve automation suitability to at least ${outputs.requiredAutomation.textContent}, reduce rework, or lower AI stack costs before rollout.`;
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

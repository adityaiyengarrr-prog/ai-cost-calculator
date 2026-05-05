const modelCatalog = {
  "gpt-5-mini": { label: "GPT-5 Mini", inputPerM: 0.25, outputPerM: 2.0, cachedInputPerM: 0.025 },
  "gpt-5": { label: "GPT-5", inputPerM: 1.25, outputPerM: 10.0, cachedInputPerM: 0.125 },
  "gpt-5-pro": { label: "GPT-5 Pro", inputPerM: 15.0, outputPerM: 120.0, cachedInputPerM: 0.0 },
};

const presets = {
  chatbot: {
    model: "gpt-5-mini",
    monthlyUsers: 12000,
    requestsPerUser: 14,
    inputTokens: 700,
    outputTokens: 260,
    cacheShare: 40,
    overheadTokens: 120,
    toolCalls: 1,
    tokensPerToolCall: 90,
    retryRate: 6,
    platformFee: 1100,
    reviewCost: 1800,
    implementation: 9000,
    humanMonthlyCost: 82000,
    growthRate: 35,
    monthlyRevenue: 260000,
    revenueLift: 6,
  },
  research: {
    model: "gpt-5",
    monthlyUsers: 2400,
    requestsPerUser: 35,
    inputTokens: 2400,
    outputTokens: 900,
    cacheShare: 28,
    overheadTokens: 300,
    toolCalls: 2,
    tokensPerToolCall: 220,
    retryRate: 9,
    platformFee: 2100,
    reviewCost: 3400,
    implementation: 18000,
    humanMonthlyCost: 94000,
    growthRate: 45,
    monthlyRevenue: 420000,
    revenueLift: 5,
  },
  content: {
    model: "gpt-5-mini",
    monthlyUsers: 3800,
    requestsPerUser: 24,
    inputTokens: 1300,
    outputTokens: 1100,
    cacheShare: 22,
    overheadTokens: 180,
    toolCalls: 1,
    tokensPerToolCall: 140,
    retryRate: 8,
    platformFee: 1600,
    reviewCost: 2800,
    implementation: 12000,
    humanMonthlyCost: 76000,
    growthRate: 40,
    monthlyRevenue: 300000,
    revenueLift: 7,
  },
  agent: {
    model: "gpt-5",
    monthlyUsers: 800,
    requestsPerUser: 120,
    inputTokens: 3000,
    outputTokens: 1300,
    cacheShare: 48,
    overheadTokens: 420,
    toolCalls: 4,
    tokensPerToolCall: 260,
    retryRate: 12,
    platformFee: 4200,
    reviewCost: 5400,
    implementation: 26000,
    humanMonthlyCost: 136000,
    growthRate: 60,
    monthlyRevenue: 680000,
    revenueLift: 4,
  },
};

const fields = {
  model: document.getElementById("model"),
  monthlyUsers: document.getElementById("monthlyUsers"),
  requestsPerUser: document.getElementById("requestsPerUser"),
  inputTokens: document.getElementById("inputTokens"),
  outputTokens: document.getElementById("outputTokens"),
  cacheShare: document.getElementById("cacheShare"),
  overheadTokens: document.getElementById("overheadTokens"),
  toolCalls: document.getElementById("toolCalls"),
  tokensPerToolCall: document.getElementById("tokensPerToolCall"),
  retryRate: document.getElementById("retryRate"),
  platformFee: document.getElementById("platformFee"),
  reviewCost: document.getElementById("reviewCost"),
  implementation: document.getElementById("implementation"),
  humanMonthlyCost: document.getElementById("humanMonthlyCost"),
  growthRate: document.getElementById("growthRate"),
  monthlyRevenue: document.getElementById("monthlyRevenue"),
  revenueLift: document.getElementById("revenueLift"),
};

const outputs = {
  monthlyRequests: document.getElementById("monthlyRequests"),
  monthlyTokenCost: document.getElementById("monthlyTokenCost"),
  monthlyAiCost: document.getElementById("monthlyAiCost"),
  annualAiCost: document.getElementById("annualAiCost"),
  costPerRequest: document.getElementById("costPerRequest"),
  costPerUser: document.getElementById("costPerUser"),
  annualSavings: document.getElementById("annualSavings"),
  roi: document.getElementById("roi"),
  conservativeAnnual: document.getElementById("conservativeAnnual"),
  baseAnnual: document.getElementById("baseAnnual"),
  growthAnnual: document.getElementById("growthAnnual"),
  breakEvenDaily: document.getElementById("breakEvenDaily"),
  monthlyInputTokens: document.getElementById("monthlyInputTokens"),
  monthlyOutputTokens: document.getElementById("monthlyOutputTokens"),
  monthlyCachedTokens: document.getElementById("monthlyCachedTokens"),
  payback: document.getElementById("payback"),
  humanBar: document.getElementById("humanBar"),
  aiBar: document.getElementById("aiBar"),
  savingsBar: document.getElementById("savingsBar"),
  insight: document.getElementById("insight"),
  recommendationHeadline: document.getElementById("recommendationHeadline"),
  recommendationBody: document.getElementById("recommendationBody"),
};

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function fillModelSelect() {
  Object.entries(modelCatalog).forEach(([key, details]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${details.label} (in ${details.inputPerM}/M, out ${details.outputPerM}/M)`;
    fields.model.appendChild(option);
  });
}

function estimateAnnualCost(inputs, usageMultiplier = 1) {
  const model = modelCatalog[inputs.model];
  const monthlyRequests = inputs.monthlyUsers * inputs.requestsPerUser * usageMultiplier;
  const perRequestInput = inputs.inputTokens + inputs.overheadTokens + inputs.toolCalls * inputs.tokensPerToolCall;
  const retryMultiplier = 1 + inputs.retryRate;

  const grossMonthlyInputTokens = monthlyRequests * perRequestInput * retryMultiplier;
  const monthlyOutputTokens = monthlyRequests * inputs.outputTokens * retryMultiplier;
  const monthlyCachedTokens = grossMonthlyInputTokens * inputs.cacheShare;
  const monthlyNonCachedInputTokens = grossMonthlyInputTokens - monthlyCachedTokens;

  const inputCost = (monthlyNonCachedInputTokens / 1_000_000) * model.inputPerM;
  const outputCost = (monthlyOutputTokens / 1_000_000) * model.outputPerM;
  const cachedCost = (monthlyCachedTokens / 1_000_000) * model.cachedInputPerM;

  const monthlyTokenCost = inputCost + outputCost + cachedCost;
  const monthlyAiCost = monthlyTokenCost + inputs.platformFee + inputs.reviewCost;
  const annualAiCost = monthlyAiCost * 12 + inputs.implementation;

  return {
    monthlyRequests,
    grossMonthlyInputTokens,
    monthlyOutputTokens,
    monthlyCachedTokens,
    monthlyTokenCost,
    monthlyAiCost,
    annualAiCost,
  };
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
  const inputs = {
    model: fields.model.value,
    monthlyUsers: Math.max(1, safeNumber(fields.monthlyUsers.value, 1)),
    requestsPerUser: Math.max(1, safeNumber(fields.requestsPerUser.value, 1)),
    inputTokens: Math.max(1, safeNumber(fields.inputTokens.value, 1)),
    outputTokens: Math.max(1, safeNumber(fields.outputTokens.value, 1)),
    cacheShare: clamp(safeNumber(fields.cacheShare.value) / 100, 0, 1),
    overheadTokens: Math.max(0, safeNumber(fields.overheadTokens.value, 0)),
    toolCalls: Math.max(0, safeNumber(fields.toolCalls.value, 0)),
    tokensPerToolCall: Math.max(0, safeNumber(fields.tokensPerToolCall.value, 0)),
    retryRate: clamp(safeNumber(fields.retryRate.value) / 100, 0, 1),
    platformFee: Math.max(0, safeNumber(fields.platformFee.value, 0)),
    reviewCost: Math.max(0, safeNumber(fields.reviewCost.value, 0)),
    implementation: Math.max(0, safeNumber(fields.implementation.value, 0)),
    humanMonthlyCost: Math.max(0, safeNumber(fields.humanMonthlyCost.value, 0)),
    growthRate: clamp(safeNumber(fields.growthRate.value) / 100, 0, 3),
    monthlyRevenue: Math.max(0, safeNumber(fields.monthlyRevenue.value, 0)),
    revenueLift: clamp(safeNumber(fields.revenueLift.value) / 100, 0, 1),
  };

  const base = estimateAnnualCost(inputs, 1);
  const conservative = estimateAnnualCost(
    {
      ...inputs,
      retryRate: clamp(inputs.retryRate * 1.2, 0, 1),
      cacheShare: clamp(inputs.cacheShare * 0.8, 0, 1),
    },
    0.9
  );
  const growth = estimateAnnualCost(
    {
      ...inputs,
      retryRate: clamp(inputs.retryRate * 1.1, 0, 1),
      cacheShare: clamp(inputs.cacheShare * 0.9, 0, 1),
    },
    1 + inputs.growthRate
  );

  const annualHumanCost = inputs.humanMonthlyCost * 12;
  const annualRevenueLift = inputs.monthlyRevenue * inputs.revenueLift * 12;
  const annualSavings = annualHumanCost - base.annualAiCost;
  const annualBenefit = annualSavings + annualRevenueLift;
  const roi = base.annualAiCost > 0 ? (annualBenefit / base.annualAiCost) * 100 : 0;
  const monthlyNetBenefit = annualBenefit / 12;
  const paybackMonths = monthlyNetBenefit > 0 ? inputs.implementation / monthlyNetBenefit : null;
  const costPerRequest = base.monthlyAiCost / Math.max(1, base.monthlyRequests);
  const breakEvenDailyRequests = costPerRequest > 0 ? Math.ceil((inputs.humanMonthlyCost / 30) / costPerRequest) : 0;

  outputs.monthlyRequests.textContent = Math.round(base.monthlyRequests).toLocaleString("en-US");
  outputs.monthlyTokenCost.textContent = money(base.monthlyTokenCost);
  outputs.monthlyAiCost.textContent = money(base.monthlyAiCost);
  outputs.annualAiCost.textContent = money(base.annualAiCost);
  outputs.costPerRequest.textContent = moneyPrecise(costPerRequest);
  outputs.costPerUser.textContent = moneyPrecise(base.monthlyAiCost / inputs.monthlyUsers);
  outputs.annualSavings.textContent = money(annualSavings);
  outputs.roi.textContent = `${roi.toFixed(1)}%`;
  outputs.conservativeAnnual.textContent = money(conservative.annualAiCost);
  outputs.baseAnnual.textContent = money(base.annualAiCost);
  outputs.growthAnnual.textContent = money(growth.annualAiCost);
  outputs.breakEvenDaily.textContent = breakEvenDailyRequests.toLocaleString("en-US");

  outputs.monthlyInputTokens.textContent = Math.round(base.grossMonthlyInputTokens).toLocaleString("en-US");
  outputs.monthlyOutputTokens.textContent = Math.round(base.monthlyOutputTokens).toLocaleString("en-US");
  outputs.monthlyCachedTokens.textContent = Math.round(base.monthlyCachedTokens).toLocaleString("en-US");
  outputs.payback.textContent = paybackMonths !== null ? `${paybackMonths.toFixed(1)} months` : "No payback";

  outputs.annualSavings.classList.toggle("positive", annualSavings >= 0);
  outputs.annualSavings.classList.toggle("negative", annualSavings < 0);

  const max = Math.max(annualHumanCost, base.annualAiCost, Math.abs(annualSavings), 1);
  outputs.humanBar.style.width = `${(annualHumanCost / max) * 100}%`;
  outputs.aiBar.style.width = `${(base.annualAiCost / max) * 100}%`;
  outputs.savingsBar.style.width = `${(Math.abs(annualSavings) / max) * 100}%`;

  if (annualBenefit > 0) {
    outputs.recommendationHeadline.textContent = "Proceed: economics are positive in the base case.";
    outputs.recommendationBody.textContent = `Estimated year-1 benefit is ${money(annualBenefit)} with ${roi.toFixed(
      1
    )}% ROI. Prioritize cache optimization and retry reduction to protect margin as usage grows.`;
  } else {
    outputs.recommendationHeadline.textContent = "Hold: improve assumptions before scaling.";
    outputs.recommendationBody.textContent = `Current model shows negative year-1 benefit (${money(
      annualBenefit
    )}). Improve cache share, reduce output length, and tighten retry controls before rollout.`;
  }

  if (annualSavings >= 0) {
    outputs.insight.textContent = `Base case: ${money(base.annualAiCost)} annual AI cost vs ${money(
      annualHumanCost
    )} human cost, saving ${money(annualSavings)} per year. Cost per request is ${moneyPrecise(costPerRequest)}.`;
  } else {
    outputs.insight.textContent = `Current configuration costs ${money(
      Math.abs(annualSavings)
    )} more annually than the human baseline. Improve cache share, lower output length, or switch to lower-cost model tier.`;
  }
}

fillModelSelect();
assignPreset("chatbot");

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
  field.addEventListener("change", update);
});

document.querySelectorAll(".preset").forEach((button) => {
  button.addEventListener("click", () => assignPreset(button.dataset.preset));
});

update();

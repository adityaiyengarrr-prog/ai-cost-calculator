const models = window.MODEL_PRICING || [];
const latestBlogs = [
  {
    title: "AI Token Pricing 2026: What Changed This Quarter",
    href: "/blog/ai-token-pricing-2026-quarterly-update",
    meta: "Pricing Update",
  },
  {
    title: "OpenAI vs Anthropic Token Cost Benchmarks for Production Apps",
    href: "/blog/openai-vs-anthropic-token-cost-benchmarks",
    meta: "Comparison",
  },
  {
    title: "How to Cut LLM Spend by 30% with Prompt and Output Controls",
    href: "/blog/reduce-llm-spend-prompt-output-controls",
    meta: "Optimization",
  },
];

const PRESETS = {
  chatbot: {
    inputTokens: 1200,
    outputTokens: 450,
    callsPerDay: 200,
    workingDays: 22,
    overheadPercent: 10,
    marginPercent: 15,
    traditionalMonthlyCost: 2500,
  },
  rag: {
    inputTokens: 2800,
    outputTokens: 650,
    callsPerDay: 120,
    workingDays: 22,
    overheadPercent: 12,
    marginPercent: 20,
    traditionalMonthlyCost: 4200,
  },
  content: {
    inputTokens: 1800,
    outputTokens: 1200,
    callsPerDay: 60,
    workingDays: 20,
    overheadPercent: 8,
    marginPercent: 15,
    traditionalMonthlyCost: 3200,
  },
  agent: {
    inputTokens: 2200,
    outputTokens: 900,
    callsPerDay: 240,
    workingDays: 22,
    overheadPercent: 15,
    marginPercent: 25,
    traditionalMonthlyCost: 6800,
  },
};

const fields = {
  preset: document.getElementById("preset"),
  model: document.getElementById("model"),
  inputTokens: document.getElementById("inputTokens"),
  outputTokens: document.getElementById("outputTokens"),
  callsPerDay: document.getElementById("callsPerDay"),
  workingDays: document.getElementById("workingDays"),
  overheadPercent: document.getElementById("overheadPercent"),
  marginPercent: document.getElementById("marginPercent"),
  traditionalMonthlyCost: document.getElementById("traditionalMonthlyCost"),
};

const outputs = {
  inputCost: document.getElementById("inputCost"),
  outputCost: document.getElementById("outputCost"),
  costPerRun: document.getElementById("costPerRun"),
  monthlyCost: document.getElementById("monthlyCost"),
  yearlyCost: document.getElementById("yearlyCost"),
  monthlySavings: document.getElementById("monthlySavings"),
  annualSavings: document.getElementById("annualSavings"),
  breakEvenDays: document.getElementById("breakEvenDays"),
  roiPercent: document.getElementById("roiPercent"),
  modelNotice: document.getElementById("modelNotice"),
  volumeSummary: document.getElementById("volumeSummary"),
  blogList: document.getElementById("blogList"),
  comparisonBody: document.getElementById("comparisonBody"),
};

function usd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function integer(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fillModels() {
  models.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${item.provider} - ${item.model}`;
    fields.model.appendChild(option);
  });
}

function renderComparisonTable() {
  if (!outputs.comparisonBody) return;
  outputs.comparisonBody.innerHTML = "";

  models.forEach((item) => {
    const row = document.createElement("tr");
    const input = item.inputPerM === null ? "Needs verification" : usd(item.inputPerM);
    const output = item.outputPerM === null ? "Needs verification" : usd(item.outputPerM);
    row.innerHTML = `<td>${item.provider}</td><td>${item.model}</td><td>${input}</td><td>${output}</td>`;
    outputs.comparisonBody.appendChild(row);
  });
}

function renderBlogs() {
  if (!outputs.blogList) return;
  outputs.blogList.innerHTML = "";

  latestBlogs.forEach((post) => {
    const article = document.createElement("article");
    article.className = "blog-card";
    article.innerHTML = `<p class="blog-meta">${post.meta}</p><h3><a href="${post.href}">${post.title}</a></h3>`;
    outputs.blogList.appendChild(article);
  });
}

function applyPreset() {
  const preset = PRESETS[fields.preset.value];
  if (!preset) return;
  fields.inputTokens.value = String(preset.inputTokens);
  fields.outputTokens.value = String(preset.outputTokens);
  fields.callsPerDay.value = String(preset.callsPerDay);
  fields.workingDays.value = String(preset.workingDays);
  fields.overheadPercent.value = String(preset.overheadPercent);
  fields.marginPercent.value = String(preset.marginPercent);
  fields.traditionalMonthlyCost.value = String(preset.traditionalMonthlyCost);
}

function setUnavailable() {
  outputs.inputCost.textContent = "N/A";
  outputs.outputCost.textContent = "N/A";
  outputs.costPerRun.textContent = "N/A";
  outputs.monthlyCost.textContent = "N/A";
  outputs.yearlyCost.textContent = "N/A";
  outputs.monthlySavings.textContent = "N/A";
  outputs.annualSavings.textContent = "N/A";
  outputs.breakEvenDays.textContent = "N/A";
  outputs.roiPercent.textContent = "N/A";
  outputs.volumeSummary.textContent = "Update model pricing to see cost and ROI projections.";
}

function update() {
  const selected = models[number(fields.model.value, 0)] || models[0];
  const inputTokens = Math.max(0, number(fields.inputTokens.value, 0));
  const outputTokens = Math.max(0, number(fields.outputTokens.value, 0));
  const callsPerDay = Math.max(0, number(fields.callsPerDay.value, 0));
  const workingDays = Math.max(1, number(fields.workingDays.value, 1));
  const overheadPercent = Math.max(0, number(fields.overheadPercent.value, 0));
  const marginPercent = Math.max(0, number(fields.marginPercent.value, 0));
  const traditionalMonthlyCost = Math.max(0, number(fields.traditionalMonthlyCost.value, 0));

  if (!selected || selected.needsVerification || selected.inputPerM === null || selected.outputPerM === null) {
    outputs.modelNotice.textContent = "Pricing needs verification for this model. Select a priced model or update model-pricing.js.";
    outputs.modelNotice.classList.add("warn");
    setUnavailable();
    return;
  }

  outputs.modelNotice.textContent = `Using ${selected.provider} ${selected.model} pricing: ${usd(selected.inputPerM)}/1M input, ${usd(selected.outputPerM)}/1M output.`;
  outputs.modelNotice.classList.remove("warn");

  const inputCostPerRun = (inputTokens / 1_000_000) * selected.inputPerM;
  const outputCostPerRun = (outputTokens / 1_000_000) * selected.outputPerM;
  const baseCostPerRun = inputCostPerRun + outputCostPerRun;

  const operationalMultiplier = 1 + overheadPercent / 100;
  const suggestedSellingMultiplier = 1 + marginPercent / 100;
  const adjustedCostPerRun = baseCostPerRun * operationalMultiplier;

  const monthlyRuns = callsPerDay * workingDays;
  const monthlyInput = inputCostPerRun * monthlyRuns;
  const monthlyOutput = outputCostPerRun * monthlyRuns;
  const monthlyCost = adjustedCostPerRun * monthlyRuns;
  const yearlyCost = monthlyCost * 12;

  const monthlySavings = traditionalMonthlyCost - monthlyCost;
  const annualSavings = monthlySavings * 12;
  const roiPercent = traditionalMonthlyCost > 0
    ? (monthlySavings / traditionalMonthlyCost) * 100
    : 0;

  const dailySavings = workingDays > 0 ? monthlySavings / workingDays : 0;
  const breakEvenDays = dailySavings > 0 ? Math.ceil(500 / dailySavings) : null;

  outputs.inputCost.textContent = usd(monthlyInput);
  outputs.outputCost.textContent = usd(monthlyOutput);
  outputs.costPerRun.textContent = usd(adjustedCostPerRun);
  outputs.monthlyCost.textContent = usd(monthlyCost);
  outputs.yearlyCost.textContent = usd(yearlyCost);
  outputs.monthlySavings.textContent = usd(monthlySavings);
  outputs.annualSavings.textContent = usd(annualSavings);
  outputs.roiPercent.textContent = `${roiPercent.toFixed(1)}%`;
  outputs.breakEvenDays.textContent = breakEvenDays ? `${integer(breakEvenDays)} days` : "No break-even";
  outputs.volumeSummary.textContent = `${integer(monthlyRuns)} monthly calls. Suggested client pricing floor: ${usd(adjustedCostPerRun * suggestedSellingMultiplier)} per request.`;
}

fillModels();
renderComparisonTable();
renderBlogs();
applyPreset();
update();

if (fields.preset) {
  fields.preset.addEventListener("change", () => {
    applyPreset();
    update();
  });
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
  field.addEventListener("change", update);
});

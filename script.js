const models = window.MODEL_PRICING || [];

const fields = {
  model: document.getElementById("model"),
  inputTokens: document.getElementById("inputTokens"),
  outputTokens: document.getElementById("outputTokens"),
  runs: document.getElementById("runs"),
  monthlyMultiplier: document.getElementById("monthlyMultiplier"),
};

const outputs = {
  inputCost: document.getElementById("inputCost"),
  outputCost: document.getElementById("outputCost"),
  costPerRun: document.getElementById("costPerRun"),
  monthlyCost: document.getElementById("monthlyCost"),
  modelNotice: document.getElementById("modelNotice"),
};

function usd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fillModels() {
  models.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${item.provider} — ${item.model}`;
    fields.model.appendChild(option);
  });
}

function update() {
  const selected = models[number(fields.model.value, 0)] || models[0];
  const inputTokens = Math.max(0, number(fields.inputTokens.value, 0));
  const outputTokens = Math.max(0, number(fields.outputTokens.value, 0));
  const runs = Math.max(1, number(fields.runs.value, 1));
  const monthlyMultiplier = Math.max(0, number(fields.monthlyMultiplier.value, 1));

  if (!selected || selected.needsVerification || selected.inputPerM === null || selected.outputPerM === null) {
    outputs.modelNotice.textContent = "Pricing needs verification for this model. Select a priced model or update model-pricing.js.";
    outputs.modelNotice.classList.add("warn");
    outputs.inputCost.textContent = "N/A";
    outputs.outputCost.textContent = "N/A";
    outputs.costPerRun.textContent = "N/A";
    outputs.monthlyCost.textContent = "N/A";
    return;
  }

  outputs.modelNotice.textContent = `Using ${selected.provider} ${selected.model} pricing: ${usd(selected.inputPerM)}/1M input, ${usd(selected.outputPerM)}/1M output.`;
  outputs.modelNotice.classList.remove("warn");

  const inputCostPerRun = (inputTokens / 1_000_000) * selected.inputPerM;
  const outputCostPerRun = (outputTokens / 1_000_000) * selected.outputPerM;
  const totalPerRun = inputCostPerRun + outputCostPerRun;
  const monthlyCost = totalPerRun * runs * monthlyMultiplier;

  outputs.inputCost.textContent = usd(inputCostPerRun * runs * monthlyMultiplier);
  outputs.outputCost.textContent = usd(outputCostPerRun * runs * monthlyMultiplier);
  outputs.costPerRun.textContent = usd(totalPerRun);
  outputs.monthlyCost.textContent = usd(monthlyCost);
}

fillModels();
update();

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
  field.addEventListener("change", update);
});

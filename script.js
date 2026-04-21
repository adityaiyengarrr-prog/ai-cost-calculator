const fields = {
  teamSize: document.getElementById("teamSize"),
  salary: document.getElementById("salary"),
  aiCost: document.getElementById("aiCost"),
  lift: document.getElementById("lift"),
};

const outputs = {
  humanMonthly: document.getElementById("humanMonthly"),
  aiMonthly: document.getElementById("aiMonthly"),
  savingsMonthly: document.getElementById("savingsMonthly"),
  productivity: document.getElementById("productivity"),
  humanBar: document.getElementById("humanBar"),
  aiBar: document.getElementById("aiBar"),
  savingsBar: document.getElementById("savingsBar"),
  insight: document.getElementById("insight"),
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

function update() {
  const teamSize = Math.max(1, safeNumber(fields.teamSize.value, 1));
  const salary = Math.max(0, safeNumber(fields.salary.value));
  const aiCost = Math.max(0, safeNumber(fields.aiCost.value));
  const lift = Math.min(100, Math.max(0, safeNumber(fields.lift.value)));

  const humanMonthly = teamSize * salary;
  const savings = humanMonthly - aiCost;
  const outputLift = 100 + lift;

  outputs.humanMonthly.textContent = money(humanMonthly);
  outputs.aiMonthly.textContent = money(aiCost);
  outputs.savingsMonthly.textContent = money(savings);
  outputs.productivity.textContent = `${outputLift}%`;

  outputs.savingsMonthly.classList.toggle("positive", savings >= 0);
  outputs.savingsMonthly.classList.toggle("negative", savings < 0);

  // Keep analytics bars stable even when values are zero.
  const max = Math.max(humanMonthly, aiCost, Math.abs(savings), 1);
  outputs.humanBar.style.width = `${(humanMonthly / max) * 100}%`;
  outputs.aiBar.style.width = `${(aiCost / max) * 100}%`;
  outputs.savingsBar.style.width = `${(Math.abs(savings) / max) * 100}%`;

  if (savings >= 0) {
    outputs.insight.textContent = `At current assumptions, AI saves ${money(
      savings
    )} per month while lifting output by ${lift}%.`;
  } else {
    outputs.insight.textContent = `At current assumptions, AI costs ${money(
      Math.abs(savings)
    )} more per month. Consider reducing platform spend or increasing utilization.`;
  }
}

Object.values(fields).forEach((field) => {
  field.addEventListener("input", update);
});

update();

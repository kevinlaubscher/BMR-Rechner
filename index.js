// bmr.js – Frontend-only, kompakt, Makros nur in %

const form = document.getElementById('bmr-form');
const resultCard = document.getElementById('result-card');
const resultEl = document.getElementById('result');

// Vorgegebene Stufen
const PLANS = [
  { kcal: 1300, carb_pct: 35, protein_pct: 30, fat_pct: 35 },
  { kcal: 1500, carb_pct: 37, protein_pct: 27, fat_pct: 36 },
  { kcal: 1700, carb_pct: 38, protein_pct: 28, fat_pct: 34 },
  { kcal: 1900, carb_pct: 42, protein_pct: 25, fat_pct: 33 },
];

function fmt(n) {
  return new Intl.NumberFormat('de-CH').format(n);
}

function normalizeNumberInput(id) {
  const el = document.getElementById(id);
  el.value = (el.value || '').toString().replace(',', '.');
  const num = Number(el.value);
  return Number.isFinite(num) ? num : NaN;
}

// Harris-Benedict (Original)
function harrisBenedictBmr(sex, age, height_cm, weight_kg) {
  if (sex === 'm') {
    return 66.47 + 13.75 * weight_kg + 5.003 * height_cm - 6.755 * age;
  }
  return 655.1 + 9.563 * weight_kg + 1.85 * height_cm - 4.676 * age;
}

// Korrekte Wahl: kleinste vorhandene Stufe, die >= BMR ist
function pickPlan(bmr) {
  const eligible = PLANS
    .slice()
    .sort((a, b) => a.kcal - b.kcal)
    .filter(p => p.kcal >= bmr);
  return eligible.length ? eligible[0] : PLANS[PLANS.length - 1];
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const sex = (new FormData(form).get('sex') || '').toString();
  const age = normalizeNumberInput('age');
  const height_cm = normalizeNumberInput('height');
  const weight_kg = normalizeNumberInput('weight');

  if (!sex || !Number.isFinite(age) || !Number.isFinite(height_cm) || !Number.isFinite(weight_kg)) {
    alert('Bitte fülle alle Felder korrekt aus.');
    return;
  }
  if (age <= 0 || height_cm <= 0 || weight_kg <= 0) {
    alert('Alter, Grösse und Gewicht müssen grösser als 0 sein.');
    return;
  }

  const bmr = Math.round(harrisBenedictBmr(sex, age, height_cm, weight_kg));
  const plan = pickPlan(bmr);

  resultEl.innerHTML = `
    <div class="macro-grid">
      <div><div>Grundumsatz</div><div>${fmt(bmr)} kcal/Tag</div></div>
      <div><div>Kalorienempfehlung</div><div>${fmt(plan.kcal)} kcal/Tag</div></div>
      <div><div>Kohlenhydrate</div><div>${plan.carb_pct}%</div></div>
      <div><div>Protein</div><div>${plan.protein_pct}%</div></div>
      <div><div>Fett</div><div>${plan.fat_pct}%</div></div>
    </div>
  `;

  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ➕ Reset-Button blendet Ergebnis aus
form.addEventListener('reset', () => {
  resultCard.hidden = true;
  resultEl.innerHTML = '';
});
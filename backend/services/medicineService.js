import Medicine from '../models/Medicine.js';
import { pickBestMedicines } from '../utils/medicineMatcher.js';

export async function searchMedicines(query, filters = {}) {
  const filter = {};
  if (filters.manufacturer) {
    filter.manufacturer = new RegExp(filters.manufacturer, 'i');
  }
  if (filters.generic) {
    filter.generic_name = new RegExp(filters.generic, 'i');
  }

  let medicines;
  if (query?.trim()) {
    medicines = await Medicine.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();

    if (!medicines.length) {
      const regex = new RegExp(query.split(/\s+/).join('|'), 'i');
      medicines = await Medicine.find({
        ...filter,
        $or: [{ name: regex }, { generic_name: regex }, { uses: regex }],
      })
        .limit(20)
        .lean();
    }
  } else {
    medicines = await Medicine.find(filter).limit(20).lean();
  }

  return medicines;
}

export async function findRelevantMedicines(userQuestion) {
  const all = await Medicine.find().lean();
  const matched = pickBestMedicines(all, userQuestion, 3);
  if (matched.length) return matched;

  const words = userQuestion.split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return [];

  const regex = new RegExp(words.join('|'), 'i');
  return Medicine.find({
    $or: [{ name: regex }, { generic_name: regex }],
  })
    .limit(3)
    .lean();
}

export async function getMedicineById(id) {
  return Medicine.findById(id).lean();
}

export async function createMedicine(data) {
  return Medicine.create(data);
}

export async function updateMedicine(id, data) {
  return Medicine.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteMedicine(id) {
  return Medicine.findByIdAndDelete(id);
}

export async function getAllMedicines() {
  return Medicine.find().sort({ name: 1 }).lean();
}

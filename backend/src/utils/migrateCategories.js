import mongoose from 'mongoose';
import { Habit } from '../models/Habit.js';
import { Settings } from '../models/Settings.js';

/**
 * Migration script to convert legacy categories to broader, general categories.
 * This script is idempotent and can be run multiple times safely.
 * 
 * Mapping:
 * - 'DSA' -> 'study'
 * - 'Aptitude' -> 'study'
 * - 'Core' -> 'study'
 * - 'Projects' -> 'work'
 * 
 * Other categories are left unchanged.
 */

const CATEGORY_MAPPING = {
  'DSA': 'study',
  'Aptitude': 'study',
  'Core': 'study',
  'Projects': 'work',
};

export async function migrateCategories() {
  console.log('Starting category migration...');

  try {
    // Get all habits
    const habits = await Habit.find({});
    console.log(`Found ${habits.length} habits to process`);

    let migratedCount = 0;
    let skippedCount = 0;

    // Update each habit's category
    for (const habit of habits) {
      const oldCategory = habit.category;
      const newCategory = CATEGORY_MAPPING[oldCategory] || oldCategory;

      if (oldCategory !== newCategory) {
        await Habit.updateOne(
          { _id: habit._id },
          { $set: { category: newCategory } }
        );
        console.log(`Migrated habit "${habit.name}": "${oldCategory}" -> "${newCategory}"`);
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Migration complete: ${migratedCount} habits migrated, ${skippedCount} habits skipped`);

    // Update settings categories array
    const settings = await Settings.findOne({ key: 'default' });
    if (settings && settings.categories) {
      const oldCategories = settings.categories;
      const newCategories = [...new Set(oldCategories.map(cat => CATEGORY_MAPPING[cat] || cat))];
      
      if (JSON.stringify(oldCategories.sort()) !== JSON.stringify(newCategories.sort())) {
        await Settings.updateOne(
          { key: 'default' },
          { $set: { categories: newCategories } }
        );
        console.log(`Updated settings categories: [${oldCategories.join(', ')}] -> [${newCategories.join(', ')}]`);
      } else {
        console.log('Settings categories already up to date');
      }
    }

    return {
      success: true,
      migratedCount,
      skippedCount,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Allow running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/progress-tracker';

  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateCategories();
    })
    .then((result) => {
      console.log('Migration result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

import db from './src/config/database.js';

async function checkAvatars() {
  try {
    const [rows] = await db.query('SELECT title, featured_image_url, author_name, author_avatar FROM posts LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAvatars();

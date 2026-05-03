import cron from 'node-cron';
import { findScheduledToPublish, update } from '../models/postModel.js';
import { triggerManualRebuild } from '../services/postService.js';
import env from '../config/env.js';

function getRebuildBranch() {
  return env.nodeEnv === 'production' ? 'release' : 'develop';
}

async function publishDuePosts() {
  const posts = await findScheduledToPublish();
  const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  if (!posts || posts.length === 0) {
    console.log(`[scheduler] ${nowIST} IST — checked, no posts due.`);
    return;
  }

  console.log(`[scheduler] ${nowIST} IST — found ${posts.length} post(s) to publish.`);

  for (const post of posts) {
    await update(post.id, {
      status: 'published',
      published_at: new Date(),
    });
    console.log(`[scheduler] Post #${post.id} published automatically.`);
  }

  // Trigger one rebuild for all newly published posts
  triggerManualRebuild(getRebuildBranch()).catch(err =>
    console.error('[scheduler] Rebuild trigger failed:', err.message)
  );
}

export function startPostScheduler() {
  // Runs every minute
  cron.schedule('* * * * *', () => {
    publishDuePosts().catch(err =>
      console.error('[scheduler] Error publishing scheduled posts:', err.message)
    );
  });
  console.log('[scheduler] Post scheduler started — checking every minute.');
}

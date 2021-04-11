import fs from 'fs';
import path from 'path';

import {
  AccessToken,
  RefreshableAuthProvider,
  StaticAuthProvider,
} from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';

const clientConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), '.config', 'config.json'), 'utf-8'),
);

const botVersion: string = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
).version;

const clientId: string = clientConfig.clientId;
const clientSecret: string = clientConfig.clientSecret;
const botChannels: string[] = clientConfig.channel;
const botName: string = clientConfig.botName;

if (!clientId || !clientSecret) {
  console.error('CLIENT_ID or CLIENT_SECRET is undefined');
  process.exit(1);
}

const tokenData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), '.config', 'tokens.json'), 'utf-8'),
);

const userlist: string[] = fs
  .readFileSync(path.join(process.cwd(), '.config', 'users.txt'), 'utf-8')
  .split('\n');

const authProvider = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, tokenData.accessToken),
  {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry:
      tokenData.expiryTimestamp === null
        ? null
        : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({
      accessToken,
      refreshToken,
      expiryDate,
    }: AccessToken) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime(),
      };
      fs.writeFileSync(
        path.join(process.cwd(), '.config', 'tokens.json'),
        JSON.stringify(newTokenData, null, 4),
        'utf-8',
      );
    },
  },
);

const chatClient = new ChatClient(authProvider, { channels: botChannels });

chatClient.connect();
chatClient.onConnect(() => {
  console.log(`Bot has been connected`);
  console.log(`Bot username: ${botName}`);
  console.log(`Bot version: ${botVersion}`);
});

chatClient.onJoin((channel, user) => {
  console.log(`Joined channel ${channel}, user ${user}`);
});

chatClient.onMessage((channel, user, _message, msg) => {
  // If user is sub or vip, it is unlikely for it to be the spambot
  const isOkay =
    msg.userInfo.isBroadcaster ||
    msg.userInfo.isMod ||
    msg.userInfo.isVip ||
    msg.userInfo.isSubscriber;
  if (isOkay) return;

  // Otherwise, check if listed
  if (userlist.indexOf(user) !== -1) {
    chatClient.ban(
      channel,
      user,
      'Your account is listed on banlist. If you are false negatives, please send an unban request',
    );
  }
});

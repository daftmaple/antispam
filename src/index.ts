import fs from 'fs';
import path from 'path';

import {
  AccessToken,
  RefreshingAuthProvider,
} from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

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

let userlist: string[] = fs
  .readFileSync(path.join(process.cwd(), '.config', 'users.txt'), 'utf-8')
  .split('\n');;

// Update every 60 minutes 
const updateUserList = setInterval(() => {
  userlist = fs
    .readFileSync(path.join(process.cwd(), '.config', 'users.txt'), 'utf-8')
    .split('\n');
  console.log(`Loading ${userlist.length} users on banlist`);
}, 60 * 60 * 1000);


const authProvider = new RefreshingAuthProvider(
  {
    clientId, clientSecret,
    onRefresh: async (tokenData: AccessToken) => {
      fs.writeFileSync(
        path.join(process.cwd(), '.config', 'tokens.json'),
        JSON.stringify(tokenData, null, 4),
        'utf-8',
      );
    },
  },
  tokenData
);

const chatClient = new ChatClient({authProvider, channels: botChannels});

chatClient.connect();
chatClient.onConnect(() => {
  console.log(`Bot has been connected`);
  console.log(`Bot username: ${botName}`);
  console.log(`Bot version: ${botVersion}`);
  console.log(`Loading ${userlist.length} users on banlist`);
});

chatClient.onJoin((channel, user) => {
  console.log(`Joined channel ${channel}, user ${user}`);
});

chatClient.onMessage((channel, user, _message, msg) => {
  // If user is broadcaster/mod/vip, skip filtering
  const isOkay =
    msg.userInfo.isBroadcaster ||
    msg.userInfo.isMod ||
    msg.userInfo.isVip;
  if (isOkay) return;

  // Otherwise, check if listed
  if (userlist.indexOf(user) !== -1) {
    chatClient.ban(
      channel,
      user,
      'Your account is listed on banlist. If you are false negatives, please send an unban request in order to remove this username from banlist.',
    );
  }
});

process.on('exit', () => {
  clearInterval(updateUserList);
});

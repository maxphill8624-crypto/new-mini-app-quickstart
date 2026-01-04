#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import fs from 'fs';

console.log('🔐 Generating new Polygon wallet for bot...\n');

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('✅ New Wallet Created!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📍 Wallet Address (PUBLIC):');
console.log(wallet.address);
console.log('\n🔑 Private Key (SECRET - NEVER SHARE):');
console.log(wallet.privateKey);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create .env.local file
const envContent = `# Polymarket Bot Configuration - AUTO-GENERATED
# ⚠️ NEVER COMMIT THIS FILE!

# Wallet Configuration
POLYMARKET_PRIVATE_KEY=${wallet.privateKey}

# Polygon RPC URL
RPC_URL=https://polygon-rpc.com

# Trading Configuration
MAX_POSITION_SIZE=10
MAX_CONCURRENT_TRADES=3
MIN_LIQUIDITY=1000

# Risk Management
STOP_LOSS_PERCENTAGE=10
TAKE_PROFIT_PERCENTAGE=20
MAX_SLIPPAGE=5
MAX_HOLDING_TIME=24

# AI Configuration (optional - add your key if you have one)
AI_ENABLED=false
ANTHROPIC_API_KEY=

# AI Settings
AI_CONFIDENCE_THRESHOLD=0.7

# Monitoring
ENABLE_DASHBOARD=true
LOG_LEVEL=info
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ Created .env.local with your private key\n');

console.log('📋 NEXT STEPS:\n');
console.log('1. Fund this wallet with USDC on Polygon Network');
console.log(`   Send USDC to: ${wallet.address}`);
console.log('');
console.log('2. Add small amount of MATIC for gas fees');
console.log(`   Send ~0.1 MATIC to: ${wallet.address}`);
console.log('');
console.log('3. Run the bot:');
console.log('   npm run bot');
console.log('');
console.log('⚠️  IMPORTANT: Keep your private key safe!');
console.log('   - NEVER share it with anyone');
console.log('   - NEVER commit .env.local to git');
console.log('   - Start with small amounts for testing\n');

console.log('💾 Your wallet info has been saved to .env.local');
console.log('🔒 This file is ignored by git for security\n');

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setup() {
  console.log('Setting up test data...');
  try {
    await prisma.category.upsert({
      where: { name: 'Machine Learning' },
      update: {},
      create: { name: 'Machine Learning' },
    });
    await prisma.category.upsert({
      where: { name: 'Frontend' },
      update: {},
      create: { name: 'Frontend' },
    });
    console.log('Categories created.');
  } catch (e) {
    console.error('Setup failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:3000/api';
  const authUrl = 'http://localhost:3000/auth';
  const email = `test${Date.now()}@example.com`;
  const password = 'Password123!';
  
  console.log('\n--- Registering User ---');
  const regRes = await fetch(`${authUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'John',
      lastName: 'Doe',
      nickname: `johnny${Date.now()}`,
      categories: [1]
    })
  });
  const regData = await regRes.json();
  const token = regData.accessToken;
  if (!token) {
     console.error('Registration failed:', regData);
     return;
  }
  console.log('User registered.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Get categories to use their IDs
  const catRes = await fetch(`http://localhost:3000/categories`);
  const categories = await catRes.json();
  const catIds = categories.map(c => c.id);

  console.log('\n--- Creating Community ---');
  const commRes = await fetch(`${baseUrl}/communities`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'AI Enthusiasts',
      description: 'A community for AI lovers',
      directions: catIds.slice(0, 1)
    })
  });
  const community = await commRes.json();
  console.log('Community Created:', community.name, 'Slug:', community.slug);

  console.log('\n--- Getting Community Details ---');
  const detailRes = await fetch(`${baseUrl}/communities/${community.slug}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const details = await detailRes.json();
  console.log('Status for Creator:', details.currentUserStatus);

  console.log('\n--- Creating Another User to Test Join Request ---');
  const user2Res = await fetch(`${authUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `user2${Date.now()}@example.com`,
      password,
      firstName: 'Jane',
      lastName: 'Doe',
      nickname: `jane${Date.now()}`,
      categories: [1]
    })
  });
  const user2Data = await user2Res.json();
  const token2 = user2Data.accessToken;

  console.log('\n--- Sending Join Request from User 2 ---');
  const joinRes = await fetch(`${baseUrl}/communities/${community.id}/join-request`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const joinData = await joinRes.json();
  console.log('Join Request Response:', joinData.message);

  console.log('\n--- Checking Community Details for User 2 ---');
  const detail2Res = await fetch(`${baseUrl}/communities/${community.slug}`, {
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  const details2 = await detail2Res.json();
  console.log('Status for User 2:', details2.currentUserStatus);

  console.log('\n--- Testing Teams (List) ---');
  const teamListRes = await fetch(`${baseUrl}/teams`);
  const teams = await teamListRes.json();
  console.log('Teams Count:', teams.items.length);

  console.log('\n--- Testing Delete Community ---');
  const delRes = await fetch(`${baseUrl}/communities/${community.id}`, {
    method: 'DELETE',
    headers
  });
  const delData = await delRes.json();
  console.log('Delete Response:', delData.message);

  console.log('\n--- Final Verification: Community should be 404 ---');
  const finalRes = await fetch(`${baseUrl}/communities/${community.slug}`);
  console.log('Final Details Status:', finalRes.status);
}

async function main() {
  await setup();
  await runTests();
}

main().catch(err => {
  console.error(err);
});

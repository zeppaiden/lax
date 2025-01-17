import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config()

const NETWORK_ID = '550e8400-e29b-41d4-a716-446655440001'
const CHANNEL_ID = '37880e7f-165e-4618-951e-3da2128b933e'

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
)

// Bot accounts from bots.json
const BOTS = [
  {
    account_id: 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', // Neo
    email: 'neo@matrix.ai',
    uname: 'neo',
    fname: 'Neo',
    lname: 'Anderson',
    messages: [
      "I know kung fu... and TypeScript!",
      "The Matrix has you... debugging code.",
      "There is no spoon, only callbacks.",
      "Follow the white rabbit into the rabbit hole of async/await.",
      "Free your mind from legacy code."
    ]
  },
  {
    account_id: 'ef963054-feb8-4934-b544-299932fb8667', // Iron Man
    email: 'tony@stark.ai',
    uname: 'ironman',
    fname: 'Tony',
    lname: 'Stark',
    messages: [
      "JARVIS, run the test suite.",
      "I am Iron Man, and this is my favorite IDE.",
      "Sometimes you gotta run before you can walk... or write tests.",
      "We're dealing with something we know nothing about. Like PHP.",
      "I prefer being called a genius billionaire playboy philanthropist developer."
    ]
  },
  {
    account_id: 'a322123e-e701-4613-928e-7717ec6473aa', // Jack Sparrow
    email: 'jack@blackpearl.ai',
    uname: 'jacksparrow',
    fname: 'Jack',
    lname: 'Sparrow',
    messages: [
      "Why is the code gone?",
      "This is the day you will always remember as the day you almost caught a null pointer exception!",
      "The problem is not the problem. The problem is your attitude about the problem.",
      "Me? I'm dishonest, and you can always trust a dishonest man to be dishonest. Honestly.",
      "Now... bring me that deployment pipeline!"
    ]
  },
  {
    account_id: 'd4c61583-37d4-41e1-ba10-698500eb057e', // Tyler Durden
    email: 'tyler@fightclub.ai',
    uname: 'tylerdurden',
    fname: 'Tyler',
    lname: 'Durden',
    messages: [
      "The first rule of Git Club is: you do not talk about Git Club.",
      "This is your bug report. This is your bug report on TypeScript.",
      "You are not your code.",
      "We buy things we don't need with technical debt we can't afford.",
      "Everything's a copy of a copy of a copy. Especially in JavaScript."
    ]
  },
  {
    account_id: 'b5736eb3-c105-46db-a476-b53ce720c892', // Shrek
    email: 'shrek@swamp.ai',
    uname: 'shrek',
    fname: 'Shrek',
    lname: 'Ogre',
    messages: [
      "Coding is like onions, it has layers!",
      "Better out than in, I always say. Especially with error handling.",
      "What are you doing in my codebase?!",
      "That'll do, function. That'll do.",
      "This is the part where you run the tests."
    ]
  }
]

async function seedTestMessages() {
  console.log('🌱 Starting to seed test messages...')
  
  // Create bot accounts if they don't exist
  console.log('Ensuring all bot accounts exist...')
  for (const bot of BOTS) {
    const { data: existingAccount } = await supabase
      .from('accounts')
      .select()
      .eq('account_id', bot.account_id)
      .single()
    
    if (!existingAccount) {
      const { error } = await supabase
        .from('accounts')
        .insert({
          account_id: bot.account_id,
          email: bot.email,
          uname: bot.uname,
          fname: bot.fname,
          lname: bot.lname,
          robot: true
        })
      
      if (error) {
        console.error(`Failed to create bot ${bot.uname}:`, error.message)
      } else {
        console.log(`✅ Created bot ${bot.uname}`)
      }
    } else {
      console.log(`✅ Bot ${bot.uname} already exists`)
    }
  }

  // Add bots to network
  console.log('\nAdding bots to network...')
  for (const bot of BOTS) {
    const { error } = await supabase
      .from('networks_accounts')
      .insert({
        network_id: NETWORK_ID,
        account_id: bot.account_id
      })
      .select()
    
    if (error && !error.message.includes('duplicate key')) {
      console.error(`Failed to add bot ${bot.uname} to network:`, error.message)
    } else {
      console.log(`✅ Bot ${bot.uname} added to network`)
    }
  }

  // Add bots to channel
  console.log('\nAdding bots to channel...')
  for (const bot of BOTS) {
    const { error } = await supabase
      .from('channels_accounts')
      .insert({
        channel_id: CHANNEL_ID,
        account_id: bot.account_id
      })
      .select()
    
    if (error && !error.message.includes('duplicate key')) {
      console.error(`Failed to add bot ${bot.uname} to channel:`, error.message)
    } else {
      console.log(`✅ Bot ${bot.uname} added to channel`)
    }
  }

  // Create messages
  console.log('\nCreating messages...')
  for (const bot of BOTS) {
    console.log(`\n🤖 Creating messages for bot ${bot.uname}...`)
    
    for (const content of bot.messages) {
      const { error } = await supabase
        .from('messages')
        .insert({
          message_id: uuidv4(),
          channel_id: CHANNEL_ID,
          created_by: bot.account_id,
          content: content,
          meta: { is_test: true }
        })
      
      if (error) {
        console.error(`❌ Failed to create message: ${error.message}`)
      } else {
        console.log(`✅ Created message: ${content.slice(0, 50)}...`)
      }

      // Add a small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  console.log('\n✨ Finished seeding test messages!')
}

// Run the seeding function
seedTestMessages().catch(console.error) 
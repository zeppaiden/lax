-- Insert bot accounts
INSERT INTO accounts (account_id, email, uname, fname, lname, robot)
VALUES
  ('c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'neo@matrix.ai', 'neo', 'Neo', 'Anderson', true),
  ('ef963054-feb8-4934-b544-299932fb8667', 'tony@stark.ai', 'ironman', 'Tony', 'Stark', true),
  ('a322123e-e701-4613-928e-7717ec6473aa', 'jack@blackpearl.ai', 'jacksparrow', 'Jack', 'Sparrow', true),
  ('d4c61583-37d4-41e1-ba10-698500eb057e', 'tyler@fightclub.ai', 'tylerdurden', 'Tyler', 'Durden', true),
  ('b5736eb3-c105-46db-a476-b53ce720c892', 'shrek@swamp.ai', 'shrek', 'Shrek', 'Ogre', true)
ON CONFLICT (account_id) DO NOTHING;

-- Add bots to network
INSERT INTO networks_accounts (network_id, account_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d'),
  ('550e8400-e29b-41d4-a716-446655440001', 'ef963054-feb8-4934-b544-299932fb8667'),
  ('550e8400-e29b-41d4-a716-446655440001', 'a322123e-e701-4613-928e-7717ec6473aa'),
  ('550e8400-e29b-41d4-a716-446655440001', 'd4c61583-37d4-41e1-ba10-698500eb057e'),
  ('550e8400-e29b-41d4-a716-446655440001', 'b5736eb3-c105-46db-a476-b53ce720c892')
ON CONFLICT (network_id, account_id) DO NOTHING;

-- Add bots to channel
INSERT INTO channels_accounts (channel_id, account_id)
VALUES
  ('37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d'),
  ('37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667'),
  ('37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa'),
  ('37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e'),
  ('37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892')
ON CONFLICT (channel_id, account_id) DO NOTHING;

-- Insert Neo's messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'I know kung fu... and TypeScript!', '{"is_test": true}', to_tsvector('english', 'I know kung fu... and TypeScript!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'The Matrix has you... debugging code.', '{"is_test": true}', to_tsvector('english', 'The Matrix has you... debugging code.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'There is no spoon, only callbacks.', '{"is_test": true}', to_tsvector('english', 'There is no spoon, only callbacks.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Follow the white rabbit into the rabbit hole of async/await.', '{"is_test": true}', to_tsvector('english', 'Follow the white rabbit into the rabbit hole of async/await.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Free your mind from legacy code.', '{"is_test": true}', to_tsvector('english', 'Free your mind from legacy code.'));

-- Insert Iron Man's messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'JARVIS, run the test suite.', '{"is_test": true}', to_tsvector('english', 'JARVIS, run the test suite.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'I am Iron Man, and this is my favorite IDE.', '{"is_test": true}', to_tsvector('english', 'I am Iron Man, and this is my favorite IDE.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'Sometimes you gotta run before you can walk... or write tests.', '{"is_test": true}', to_tsvector('english', 'Sometimes you gotta run before you can walk... or write tests.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'We''re dealing with something we know nothing about. Like PHP.', '{"is_test": true}', to_tsvector('english', 'We''re dealing with something we know nothing about. Like PHP.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'I prefer being called a genius billionaire playboy philanthropist developer.', '{"is_test": true}', to_tsvector('english', 'I prefer being called a genius billionaire playboy philanthropist developer.'));

-- Insert Jack Sparrow's messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'Why is the code gone?', '{"is_test": true}', to_tsvector('english', 'Why is the code gone?')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'This is the day you will always remember as the day you almost caught a null pointer exception!', '{"is_test": true}', to_tsvector('english', 'This is the day you will always remember as the day you almost caught a null pointer exception!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'The problem is not the problem. The problem is your attitude about the problem.', '{"is_test": true}', to_tsvector('english', 'The problem is not the problem. The problem is your attitude about the problem.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'Me? I''m dishonest, and you can always trust a dishonest man to be dishonest. Honestly.', '{"is_test": true}', to_tsvector('english', 'Me? I''m dishonest, and you can always trust a dishonest man to be dishonest. Honestly.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'Now... bring me that deployment pipeline!', '{"is_test": true}', to_tsvector('english', 'Now... bring me that deployment pipeline!'));

-- Insert Tyler Durden's messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'The first rule of Git Club is: you do not talk about Git Club.', '{"is_test": true}', to_tsvector('english', 'The first rule of Git Club is: you do not talk about Git Club.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'This is your bug report. This is your bug report on TypeScript.', '{"is_test": true}', to_tsvector('english', 'This is your bug report. This is your bug report on TypeScript.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'You are not your code.', '{"is_test": true}', to_tsvector('english', 'You are not your code.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'We buy things we don''t need with technical debt we can''t afford.', '{"is_test": true}', to_tsvector('english', 'We buy things we don''t need with technical debt we can''t afford.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'Everything''s a copy of a copy of a copy. Especially in JavaScript.', '{"is_test": true}', to_tsvector('english', 'Everything''s a copy of a copy of a copy. Especially in JavaScript.'));

-- Insert Shrek's messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Coding is like onions, it has layers!', '{"is_test": true}', to_tsvector('english', 'Coding is like onions, it has layers!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Better out than in, I always say. Especially with error handling.', '{"is_test": true}', to_tsvector('english', 'Better out than in, I always say. Especially with error handling.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'What are you doing in my codebase?!', '{"is_test": true}', to_tsvector('english', 'What are you doing in my codebase?!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'That''ll do, function. That''ll do.', '{"is_test": true}', to_tsvector('english', 'That''ll do, function. That''ll do.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'This is the part where you run the tests.', '{"is_test": true}', to_tsvector('english', 'This is the part where you run the tests.'));

-- Insert more Neo messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'What if I told you... recursion is just a loop in disguise?', '{"is_test": true}', to_tsvector('english', 'What if I told you... recursion is just a loop in disguise?')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Do not try to fix the bug—that''s impossible. Instead, only try to realize the truth: there is no bug.', '{"is_test": true}', to_tsvector('english', 'Do not try to fix the bug—that''s impossible. Instead, only try to realize the truth: there is no bug.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'I can dodge compiler errors.', '{"is_test": true}', to_tsvector('english', 'I can dodge compiler errors.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'The time has come to make a choice: blue screen or red screen of death?', '{"is_test": true}', to_tsvector('english', 'The time has come to make a choice: blue screen or red screen of death?')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Remember... all I''m offering is the truth about functional programming. Nothing more.', '{"is_test": true}', to_tsvector('english', 'Remember... all I''m offering is the truth about functional programming. Nothing more.'));

-- Insert more Iron Man messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'If you''re nothing without that framework, then you shouldn''t have it.', '{"is_test": true}', to_tsvector('english', 'If you''re nothing without that framework, then you shouldn''t have it.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'Let''s face it, this is not the worst bug I''ve caught you committing.', '{"is_test": true}', to_tsvector('english', 'Let''s face it, this is not the worst bug I''ve caught you committing.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'Big man in a suit of armor. Take that away, what are you? Full-stack developer.', '{"is_test": true}', to_tsvector('english', 'Big man in a suit of armor. Take that away, what are you? Full-stack developer.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'I already told you, I don''t want to join your Agile standup.', '{"is_test": true}', to_tsvector('english', 'I already told you, I don''t want to join your Agile standup.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'That''s how code works! Did you know that? Because I didn''t know that.', '{"is_test": true}', to_tsvector('english', 'That''s how code works! Did you know that? Because I didn''t know that.'));

-- Insert more Jack Sparrow messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'You''ve heard of me. All the stories about my perfect git commits.', '{"is_test": true}', to_tsvector('english', 'You''ve heard of me. All the stories about my perfect git commits.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'Stop blowing holes in my codebase!', '{"is_test": true}', to_tsvector('english', 'Stop blowing holes in my codebase!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'But you have heard of my code reviews.', '{"is_test": true}', to_tsvector('english', 'But you have heard of my code reviews.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'I''ve got a jar of cookies, I''ve got a jar of cookies... and guess what''s inside it?', '{"is_test": true}', to_tsvector('english', 'I''ve got a jar of cookies, I''ve got a jar of cookies... and guess what''s inside it?')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'A developer so brave that he ignores compiler warnings.', '{"is_test": true}', to_tsvector('english', 'A developer so brave that he ignores compiler warnings.'));

-- Insert more Tyler Durden messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'I want you to refactor me as hard as you can.', '{"is_test": true}', to_tsvector('english', 'I want you to refactor me as hard as you can.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'This is your stack trace and this is your stack trace on recursion.', '{"is_test": true}', to_tsvector('english', 'This is your stack trace and this is your stack trace on recursion.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'You''re not your job. You''re not how much code you commit. You''re not the IDE you use.', '{"is_test": true}', to_tsvector('english', 'You''re not your job. You''re not how much code you commit. You''re not the IDE you use.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'In death, a member of Project Mayhem has a name. His name is Null Pointer Exception.', '{"is_test": true}', to_tsvector('english', 'In death, a member of Project Mayhem has a name. His name is Null Pointer Exception.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'This is your life, and it''s ending one deprecated API at a time.', '{"is_test": true}', to_tsvector('english', 'This is your life, and it''s ending one deprecated API at a time.'));

-- Insert more Shrek messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Could you not use global variables... FOR FIVE MINUTES?!', '{"is_test": true}', to_tsvector('english', 'Could you not use global variables... FOR FIVE MINUTES?!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Somebody once told me the code is gonna roll me, I ain''t the sharpest tool in the shed.', '{"is_test": true}', to_tsvector('english', 'Somebody once told me the code is gonna roll me, I ain''t the sharpest tool in the shed.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Oh, you were expecting Prince Charming? Sorry, you got the backend developer.', '{"is_test": true}', to_tsvector('english', 'Oh, you were expecting Prince Charming? Sorry, you got the backend developer.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Do you think maybe he''s compensating for something? *looks at massive if-else chain*', '{"is_test": true}', to_tsvector('english', 'Do you think maybe he''s compensating for something? *looks at massive if-else chain*')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Not my gumdrop buttons! I mean... not my custom CSS buttons!', '{"is_test": true}', to_tsvector('english', 'Not my gumdrop buttons! I mean... not my custom CSS buttons!'));

-- Insert even more Neo messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'I know why you''re here, Neo. You''re here because you don''t understand dependency injection.', '{"is_test": true}', to_tsvector('english', 'I know why you''re here, Neo. You''re here because you don''t understand dependency injection.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Throughout human history, we have been dependent on machines to survive. Fate, it seems, is not without a sense of Docker.', '{"is_test": true}', to_tsvector('english', 'Throughout human history, we have been dependent on machines to survive. Fate, it seems, is not without a sense of Docker.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'c1e8c0d2-b50e-4bdb-ac6b-405e27b30b6d', 'Choice. The problem is choice. Like choosing between 100 JavaScript frameworks.', '{"is_test": true}', to_tsvector('english', 'Choice. The problem is choice. Like choosing between 100 JavaScript frameworks.'));

-- Insert even more Iron Man messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'And I... am... Stack Overflow.', '{"is_test": true}', to_tsvector('english', 'And I... am... Stack Overflow.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'The truth is... I am Technical Lead.', '{"is_test": true}', to_tsvector('english', 'The truth is... I am Technical Lead.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'ef963054-feb8-4934-b544-299932fb8667', 'Doth mother know you weareth her jQuery?', '{"is_test": true}', to_tsvector('english', 'Doth mother know you weareth her jQuery?'));

-- Insert even more Jack Sparrow messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'You need to find yourself a girl, mate. Or the job''s requirements are gonna be the only thing you''re trying to match.', '{"is_test": true}', to_tsvector('english', 'You need to find yourself a girl, mate. Or the job''s requirements are gonna be the only thing you''re trying to match.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'The code is more what you''d call guidelines than actual rules.', '{"is_test": true}', to_tsvector('english', 'The code is more what you''d call guidelines than actual rules.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'a322123e-e701-4613-928e-7717ec6473aa', 'You''re off the edge of the documentation, mate. Here there be runtime errors.', '{"is_test": true}', to_tsvector('english', 'You''re off the edge of the documentation, mate. Here there be runtime errors.'));

-- Insert even more Tyler Durden messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'We write code we hate, to impress recruiters we don''t like.', '{"is_test": true}', to_tsvector('english', 'We write code we hate, to impress recruiters we don''t like.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'You met me at a very strange time in my code review.', '{"is_test": true}', to_tsvector('english', 'You met me at a very strange time in my code review.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'd4c61583-37d4-41e1-ba10-698500eb057e', 'I felt like refactoring something beautiful.', '{"is_test": true}', to_tsvector('english', 'I felt like refactoring something beautiful.'));

-- Insert even more Shrek messages
INSERT INTO messages (message_id, channel_id, created_by, content, meta, tvector)
VALUES
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'This is my swamp... I mean, my git repository!', '{"is_test": true}', to_tsvector('english', 'This is my swamp... I mean, my git repository!')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'I''m making waffles! And by waffles, I mean breaking the build.', '{"is_test": true}', to_tsvector('english', 'I''m making waffles! And by waffles, I mean breaking the build.')),
  (gen_random_uuid(), '37880e7f-165e-4618-951e-3da2128b933e', 'b5736eb3-c105-46db-a476-b53ce720c892', 'Are we there yet? No, the tests are still running.', '{"is_test": true}', to_tsvector('english', 'Are we there yet? No, the tests are still running.'));
